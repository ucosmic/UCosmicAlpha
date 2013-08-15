using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class UpdateAgreement
    {
        public UpdateAgreement(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
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
    }

    public class ValidateUpdateAgreementCommand : AbstractValidator<UpdateAgreement>
    {
        public ValidateUpdateAgreementCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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
                    .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)
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
                            x => x.Principal.Identity.Name)

                    // cannot have cyclic agreement hierarchies
                    .MustNotHaveCyclicHierarchy(entities, x => x.AgreementId)
            );

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
        }
    }

    public class HandleUpdateAgreementCommand : IHandleCommands<UpdateAgreement>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<UpdateAgreementHierarchy> _hierarchyHandler;

        public HandleUpdateAgreementCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IHandleCommands<UpdateAgreementHierarchy> hierarchyHandler
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _hierarchyHandler = hierarchyHandler;
        }

        public void Handle(UpdateAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<Agreement>().Single(x => x.Id == command.AgreementId);

            // umbrella entity reference is needed for domain to update the hierarchy nodes
            var umbrella = command.UmbrellaId.HasValue
                ? _entities.Get<Agreement>().Single(x => x.Id == command.UmbrellaId.Value) : null;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.UmbrellaId,
                    command.Type,
                    command.Name,
                    command.Content,
                    command.Notes,
                    command.StartsOn,
                    command.ExpiresOn,
                    command.IsExpirationEstimated,
                    command.IsAutoRenew,
                    command.Status,
                    command.Visibility,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            entity.Umbrella = umbrella;
            entity.UmbrellaId = umbrella != null ? umbrella.Id : (int?) null;
            entity.Type = command.Type;
            entity.Name = command.Name;
            entity.Content = command.Content;
            entity.Notes = command.Notes;
            entity.StartsOn = command.StartsOn;
            entity.ExpiresOn = command.ExpiresOn;
            entity.IsExpirationEstimated = command.IsExpirationEstimated;
            entity.IsAutoRenew = command.IsAutoRenew;
            entity.Status = command.Status;
            entity.Visibility = command.Visibility.AsEnum<AgreementVisibility>();
            entity.UpdatedByPrincipal = command.Principal.Identity.Name;
            entity.UpdatedOnUtc = DateTime.UtcNow;

            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(entity);
            _hierarchyHandler.Handle(new UpdateAgreementHierarchy(entity));
            _unitOfWork.SaveChanges();
        }
    }
}
