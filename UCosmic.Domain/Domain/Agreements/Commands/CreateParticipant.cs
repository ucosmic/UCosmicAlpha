using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateParticipant
    {
        public CreateParticipant() { }

        public CreateParticipant(IPrincipal principal, int agreementId, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            EstablishmentId = establishmentId;
        }

        internal CreateParticipant(IPrincipal principal, Agreement agreement, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (agreement == null) throw new ArgumentNullException("agreement");
            Principal = principal;
            Agreement = agreement;
            AgreementId = agreement.Id;
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        internal Agreement Agreement { get; private set; }
        public int EstablishmentId { get; private set; }
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

                    // must not allow dupliucate participants
                    .MustNotOwnParticipantWithId(queryProcessor, x => x.EstablishmentId, x => x.Principal)
                        .WithMessage(MustNotOwnParticipantWithId<object>.FailMessageFormat, x => x.EstablishmentId, x => x.AgreementId)
            );

            // when agreement is not null
            When(x => x.Agreement != null, () =>
                RuleFor(x => x.Agreement)
                    .Must((command, agreement) => agreement.Participants.All(x => x.EstablishmentId != command.EstablishmentId))
                        .WithMessage(MustNotOwnParticipantWithId<object>.FailMessageNewFormat, x => x.EstablishmentId)
            );

            // establishment id must exist in database
            RuleFor(x => x.EstablishmentId)
                .MustFindEstablishmentById(queryProcessor)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId);
        }
    }

    public class HandleCreateParticipantCommand : IHandleCommands<CreateParticipant>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateParticipantCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateParticipant command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(command.Principal));

            var entity = new AgreementParticipant
            {
                EstablishmentId = command.EstablishmentId,
                IsOwner = ownedTenantIds.Contains(command.EstablishmentId),
            };

            if (command.Agreement != null)
                entity.Agreement = command.Agreement;
            else
                entity.AgreementId = command.AgreementId;

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
                NewState = entity.ToJsonAudit(),
            };
            _entities.Create(audit);

            _entities.Create(entity);
            if (!command.NoCommit) _unitOfWork.SaveChanges();
        }
    }
}
