using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityDocument
    {
        public UpdateActivityDocument(IPrincipal principal, int activityId, int documentId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }

            Principal = principal;
            ActivityId = activityId;
            DocumentId = documentId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int DocumentId { get; private set; }
        public string Title { get; set; }
    }

    public class ValidateUpdateActivityDocumentCommand : AbstractValidator<UpdateActivityDocument>
    {
        public ValidateUpdateActivityDocumentCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.DocumentId)
                .MustFindActivityDocumentById(queryProcessor)
                .MustBeDocumentForActivity(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleUpdateActivityDocumentCommand : IHandleCommands<UpdateActivityDocument>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateActivityDocumentCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<ActivityDocument>().Single(x => x.RevisionId == command.DocumentId);
            if (entity.Title == command.Title) return;

            entity.Title = command.Title;
            entity.UpdatedOnUtc = DateTime.UtcNow;
            entity.UpdatedByPrincipal = command.Principal.Identity.Name;

            _entities.SaveChanges();
        }
    }
}

