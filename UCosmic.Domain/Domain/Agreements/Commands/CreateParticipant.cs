using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateParticipant
    {
        public CreateParticipant() { }

        public CreateParticipant(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        internal CreateParticipant(IPrincipal principal, Agreement agreement)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (agreement == null) throw new ArgumentNullException("agreement");
            Principal = principal;
            Agreement = agreement;
        }

        public IPrincipal Principal { get; internal set; }
        public int AgreementId { get; set; }
        internal Agreement Agreement { get; set; }
        public int EstablishmentId { get; set; }
        public bool IsOwner { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateParticipantCommand : AbstractValidator<CreateParticipant>
    {
        public ValidateCreateParticipantCommand(IProcessQueries queryProcessor)
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

            // when agreement is null
            When(x => x.Agreement == null, () =>
                RuleFor(x => x.AgreementId)
                    // agreement id must exist in the database
                    .MustFindAgreementById(queryProcessor, x => x.Principal)
                        .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                    // it must be owned by principal
                    .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)
            );

            // establishment id must exist in database
            RuleFor(x => x.EstablishmentId)
                .MustFindEstablishmentById(queryProcessor)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId);

            // when is owner
            When(x => x.IsOwner, () =>
                RuleFor(x => x.Principal)
                    .MustBeTenantOfEstablishment(queryProcessor, x => x.EstablishmentId)
                        .WithMessage(MustBeTenantOfEstablishment<object>.FailMessageFormat,
                            x => x.Principal.Identity.Name, x => x.EstablishmentId)
            );
        }
    }

    public class HandleCreateParticipantCommand : IHandleCommands<CreateParticipant>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateParticipantCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateParticipant command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new AgreementParticipant
            {
                EstablishmentId = command.EstablishmentId,
                IsOwner = command.IsOwner,
            };

            if (command.Agreement != null)
                entity.Agreement = command.Agreement;
            else
                entity.AgreementId = command.AgreementId;

            _entities.Create(entity);
            if (!command.NoCommit) _unitOfWork.SaveChanges();
        }
    }
}
