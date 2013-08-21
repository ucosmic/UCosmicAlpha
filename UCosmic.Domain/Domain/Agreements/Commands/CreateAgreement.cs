using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateAgreement
    {
        public CreateAgreement(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int? UmbrellaId { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public string Notes { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime ExpiresOn { get; set; }
        public bool IsExpirationEstimated { get; set; }
        public bool? IsAutoRenew { get; set; }
        public string Status { get; set; }
        public string Visibility { get; set; }
        public IEnumerable<CreateParticipant> Participants { get; set; }
        public int CreatedAgreementId { get; internal set; }
    }

    public class ValidateCreateAgreementCommand : AbstractValidator<CreateAgreement>
    {
        public ValidateCreateAgreementCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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

            // when umbrella id has value
            When(x => x.UmbrellaId.HasValue, () =>
                RuleFor(x => x.UmbrellaId.Value)

                    // it must exist in the database
                    .MustFindAgreementById(entities)
                        .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.UmbrellaId)

                    // it must be owned by the commanding principal
                    .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.UmbrellaId,
                            x => x.Principal.Identity.Name))
                ;

            // type is required
            RuleFor(x => x.Type)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementType.FailMessage)
                .Length(1, AgreementConstraints.TypeMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Agreement type", x => AgreementConstraints.TypeMaxLength, x => x.Type.Length)
            ;

            // name cannot exceed maximum length when provided
            When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
                RuleFor(x => x.Name)
                    .Length(1, AgreementConstraints.NameMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Agreement name, if entered,", x => AgreementConstraints.NameMaxLength, x => x.Name.Length)
            );

            // start date is required
            RuleFor(x => x.StartsOn)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementStartsOn.FailMessage)
                .Must(x => x > DateTime.MinValue)
                    .WithMessage(MustHaveAgreementStartsOn.FailMessage)
            ;

            // expiration date is required
            RuleFor(x => x.ExpiresOn)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementExpiresOn.FailMessage)
                .Must(x => x > DateTime.MinValue)
                    .WithMessage(MustHaveAgreementExpiresOn.FailMessage)
            ;

            // status is required
            RuleFor(x => x.Status)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementStatus.FailMessage)
                .Length(1, AgreementConstraints.StatusMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Agreement status", x => AgreementConstraints.StatusMaxLength, x => x.Status.Length)
            ;

            // visibility is required
            RuleFor(x => x.Visibility)
                .NotEmpty()
                    .WithMessage(MustHaveAgreementVisibility.FailMessage)
                .MustHaveAgreementVisibility()
                    .WithMessage(MustHaveAgreementVisibility.FailMessage)
            ;

            // participants
            RuleFor(x => x.Participants)
                // cannot be null or zero-length
                .Must(x => x != null && x.Any()).WithMessage(MustHaveParticipants.FailMessage)

                // needs at least one owning participant
                .MustHaveOwningParticipant(queryProcessor, x => x.Principal)
                    .WithMessage(MustHaveOwningParticipant<object>.FailMessage)
            ;
        }
    }

    public class HandleCreateAgreementCommand : IHandleCommands<CreateAgreement>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateParticipant> _createParticipant;
        private readonly IHandleCommands<UpdateAgreementHierarchy> _hierarchyHandler;

        public HandleCreateAgreementCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<CreateParticipant> createParticipant
            , IHandleCommands<UpdateAgreementHierarchy> hierarchyHandler
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createParticipant = createParticipant;
            _hierarchyHandler = hierarchyHandler;
        }

        public void Handle(CreateAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // umbrella entity reference is needed for domain to update the hierarchy nodes
            var umbrella = command.UmbrellaId.HasValue
                ? _entities.Get<Agreement>().Single(x => x.Id == command.UmbrellaId.Value) : null;

            var entity = new Agreement
            {
                Umbrella = umbrella,
                UmbrellaId = umbrella != null ? umbrella.Id : (int?)null,
                Type = command.Type,
                Title = "",
                Name = command.Name,
                Content = command.Content,
                Notes = command.Notes,
                StartsOn = command.StartsOn,
                ExpiresOn = command.ExpiresOn,
                IsExpirationEstimated = command.IsExpirationEstimated,
                IsAutoRenew = command.IsAutoRenew,
                Status = command.Status,
                Visibility = command.Visibility.AsEnum<AgreementVisibility>(),
            };

            foreach (var participant in command.Participants)
                _createParticipant.Handle(new CreateParticipant(command.Principal, entity, participant.EstablishmentId)
                {
                    NoCommit = true,
                    //IsOwner = participant.IsOwner,
                });

            _entities.Create(entity);
            _hierarchyHandler.Handle(new UpdateAgreementHierarchy(entity));
            _unitOfWork.SaveChanges();
            command.CreatedAgreementId = entity.Id;
        }
    }
}
