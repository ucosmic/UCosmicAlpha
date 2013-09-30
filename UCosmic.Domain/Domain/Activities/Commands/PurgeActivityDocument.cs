using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class PurgeActivityDocument
    {
        public PurgeActivityDocument(IPrincipal principal, int activityId, int documentId)
            : this(principal, documentId)
        {
            ActivityId = activityId;
        }

        internal PurgeActivityDocument(IPrincipal principal, int documentId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            DocumentId = documentId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int DocumentId { get; private set; }
        internal bool NoCommit { get; set; }
        public IPrincipal Impersonator { get; set; }
    }

    public class ValidatePurgeActivityDocumentCommand : AbstractValidator<PurgeActivityDocument>
    {
        public ValidatePurgeActivityDocumentCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            When(x => x.ActivityId != 0, () =>
            {
                RuleFor(x => x.ActivityId)
                    .MustFindActivityById(queryProcessor)
                ;

                RuleFor(x => x.Principal)
                    .MustFindUserByPrincipal(queryProcessor)
                    .MustOwnActivity(queryProcessor, x => x.ActivityId)
                ;

                RuleFor(x => x.DocumentId)
                    .MustBeDocumentForActivity(queryProcessor, x => x.ActivityId)
                ;
            });
        }
    }

    public class HandlePurgeActivityDocumentCommand : IHandleCommands<PurgeActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandlePurgeActivityDocumentCommand(ICommandEntities entities, IStoreBinaryData binaryData)
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(PurgeActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<ActivityDocument>()
                .EagerLoad(_entities, new Expression<Func<ActivityDocument, object>>[]
                {
                    x => x.ActivityValues.Activity,
                })
                .SingleOrDefault(x => x.RevisionId == command.DocumentId)
            ;
            if (entity == null) return; // delete idempotently

            entity.ActivityValues.Activity.UpdatedOnUtc = DateTime.UtcNow;
            entity.ActivityValues.Activity.UpdatedByPrincipal = command.Impersonator == null
                    ? command.Principal.Identity.Name
                    : command.Impersonator.Identity.Name;

            _entities.Purge(entity);
            _binaryData.Delete(entity.Path);

            if (!command.NoCommit)
            {
                _entities.SaveChanges();
            }
        }
    }
}
