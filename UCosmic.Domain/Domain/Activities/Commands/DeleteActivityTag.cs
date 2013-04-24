using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class DeleteActivityTag
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        public bool NoCommit { get; set; }

        public DeleteActivityTag(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteActivityTagCommand : AbstractValidator<DeleteActivityTag>
    {
        public ValidateDeleteActivityTagCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivityTag(entities, x => x.Id)
                .WithMessage(MustOwnActivityTag<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityTag id", x => x.Id)

                // id must exist in the database
                .MustFindActivityTagById(entities)
                    .WithMessage(MustFindActivityTagById.FailMessageFormat, x => x.Id)
            ;
        }
    }

    public class HandleDeleteActivityTagCommand : IHandleCommands<DeleteActivityTag>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IProcessEvents _eventProcessor;

        public HandleDeleteActivityTagCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            //, IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            //_eventProcessor = eventProcessor;
        }

        public void Handle(DeleteActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var activityTag = _entities.Get<ActivityTag>().SingleOrDefault(x => x.RevisionId == command.Id);
            if (activityTag == null) return; // delete idempotently

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
            _entities.Purge(activityTag);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
