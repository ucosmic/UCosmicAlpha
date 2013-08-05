using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class PurgeContact
    {
        public PurgeContact(IPrincipal principal, int agreementId, int contactId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            ContactId = contactId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int ContactId { get; private set; }
    }

    public class ValidatePurgeContactCommand : AbstractValidator<PurgeContact>
    {
        public ValidatePurgeContactCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;

            RuleFor(x => x.AgreementId)
                // agreement id must exist
                .MustFindAgreementById(entities)
                    .WithMessage(MustFindAgreementById.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)

                // file id must exist under this agreement
                .MustOwnContactWithId(entities, x => x.ContactId)
                    .WithMessage(MustOwnContactWithId<object>.FailMessageFormat, x => x.AgreementId, x => x.ContactId)
            ;
        }
    }

    public class HandlePurgeContactCommand : IHandleCommands<PurgeContact>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeContactCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(PurgeContact command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementContact>().Single(x => x.Id == command.ContactId);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.ContactId,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
