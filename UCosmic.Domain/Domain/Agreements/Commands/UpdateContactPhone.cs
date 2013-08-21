using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class UpdateContactPhone
    {
        public UpdateContactPhone(IPrincipal principal, int agreementId, int contactId, int phoneId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            ContactId = contactId;
            PhoneId = phoneId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int ContactId { get; private set; }
        public int PhoneId { get; private set; }
        public string Type { get; set; }
        public string Value { get; set; }
    }

    public class ValidateUpdateContactPhoneCommand : AbstractValidator<UpdateContactPhone>
    {
        public ValidateUpdateContactPhoneCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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

                // contact id must exist under this agreement
                .MustOwnContactWithId(entities, x => x.ContactId)
                    .WithMessage(MustOwnContactWithId<object>.FailMessageFormat, x => x.AgreementId, x => x.ContactId)

                // phone id must exist under this agreement & contact
                .MustOwnContactPhoneWithId(entities, x => x.ContactId, x => x.PhoneId)
                    .WithMessage(MustOwnContactPhoneWithId<object>.FailMessageFormat, x => x.PhoneId, x => x.ContactId, x => x.AgreementId)
            ;

            // type must not exceed max length when provided
            When(x => !string.IsNullOrWhiteSpace(x.Type), () =>
                RuleFor(x => x.Type)
                    .Length(1, AgreementContactPhoneConstraints.TypeMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Contact phone type", x => AgreementContactPhoneConstraints.TypeMaxLength, x => x.Type.Length)
            );

            // value is required
            RuleFor(x => x.Value)
                .NotEmpty().WithMessage(MustHaveContactPhoneValue.FailMessage)
                .Length(1, AgreementContactPhoneConstraints.ValueMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Contact phone number", x => AgreementContactPhoneConstraints.ValueMaxLength, x => x.Value.Length)
            ;
        }
    }

    public class HandleUpdateContactPhoneCommand : IHandleCommands<UpdateContactPhone>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateContactPhoneCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateContactPhone command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementContactPhone>()
                .Single(x => x.Id == command.PhoneId && x.OwnerId == command.ContactId && x.Owner.AgreementId == command.AgreementId);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.ContactId,
                    command.PhoneId,
                    command.Type,
                    command.Value,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            // update fields
            entity.Type = command.Type;
            entity.Value = command.Value;

            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
