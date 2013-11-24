using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class PurgeParticipant
    {
        public PurgeParticipant(IPrincipal principal, int agreementId, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int EstablishmentId { get; private set; }
    }

    public class ValidatePurgeParticipantCommand : AbstractValidator<PurgeParticipant>
    {
        public ValidatePurgeParticipantCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
            ;

            RuleFor(x => x.AgreementId)
                // agreement id must exist
                .MustFindAgreementById(entities)
                    .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)

                // establishment id must exist under this agreement
                .MustOwnParticipantWithId(entities, x => x.EstablishmentId)
                    .WithMessage(MustOwnParticipantWithId<object>.FailMessageFormat, x => x.EstablishmentId, x => x.AgreementId)
            ;

            // cannot be only remaining owner participant
            RuleFor(x => x.EstablishmentId)
                .MustNotBeOnlyOwningParticipant(queryProcessor, x => x.AgreementId, x => x.Principal)
                    .WithMessage(MustNotBeOnlyOwningParticipant<object>.FailMessageFormat, x => x.EstablishmentId, x => x.AgreementId);
        }
    }

    public class HandlePurgeParticipantCommand : IHandleCommands<PurgeParticipant>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeParticipantCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(PurgeParticipant command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementParticipant>()
                .Single(x => x.AgreementId == command.AgreementId && x.EstablishmentId == command.EstablishmentId);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.EstablishmentId,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
