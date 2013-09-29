using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class DeleteActivityDocument
    {
        public DeleteActivityDocument(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateDeleteActivityDocumentCommand : AbstractValidator<DeleteActivityDocument>
    {
        public ValidateDeleteActivityDocumentCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivityDocument(entities, x => x.Id)
                .WithMessage(MustOwnActivityDocument<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityDocument id", x => x.Id)
            ;
        }
    }

    public class HandleDeleteActivityDocumentCommand : IHandleCommands<DeleteActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandleDeleteActivityDocumentCommand(ICommandEntities entities, IStoreBinaryData binaryData)
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(DeleteActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var activityDocument = _entities.Get<ActivityDocument>()
                .SingleOrDefault(x => x.RevisionId == command.Id)
            ;
            if (activityDocument == null) return; // delete idempotently

            // TBD
            // log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = User.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new { command.Id }),
            //    PreviousState = activityDocument.ToJsonAudit(),
            //};

            //_entities.Create(audit);
            _entities.Purge(activityDocument);
            _binaryData.Delete(activityDocument.Path);

            if (!command.NoCommit)
            {
                _entities.SaveChanges();
            }
            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
