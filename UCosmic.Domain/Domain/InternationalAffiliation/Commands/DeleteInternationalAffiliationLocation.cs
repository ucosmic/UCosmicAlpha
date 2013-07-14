using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class DeleteInternationalAffiliationLocation
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        public bool NoCommit { get; set; }

        public DeleteInternationalAffiliationLocation(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteAffiliationLocationCommand : AbstractValidator<DeleteInternationalAffiliationLocation>
    {
        public ValidateDeleteAffiliationLocationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnAffiliationLocation(entities, x => x.Id)
                    .WithMessage(MustOwnAffiliationLocation<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "AffiliationLocation id", x => x.Id)
            ;
        }
    }

    public class HandleDeleteAffiliationLocationCommand : IHandleCommands<DeleteInternationalAffiliationLocation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IProcessEvents _eventProcessor;

        public HandleDeleteAffiliationLocationCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            //, IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            //_eventProcessor = eventProcessor;
        }

        public void Handle(DeleteInternationalAffiliationLocation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<InternationalAffiliationLocation>().SingleOrDefault(x => x.RevisionId == command.Id);
            if (activity == null) return;

            _entities.Purge(activity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

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

            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
