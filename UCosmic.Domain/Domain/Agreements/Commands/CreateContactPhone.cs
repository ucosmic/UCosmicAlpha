using System;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateContactPhone
    {
        public CreateContactPhone() { }

        public CreateContactPhone(IPrincipal principal, int agreementId, int contactId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ContactId = contactId;
            AgreementId = agreementId;
        }

        internal CreateContactPhone(IPrincipal principal, AgreementContact contact)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Contact = contact;
            ContactId = contact.Id;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int ContactId { get; private set; }
        public string Type { get; set; }
        public string Value { get; set; }

        public int CreatedContactPhoneId { get; internal set; }
        internal AgreementContactPhone CreatedContactPhone { get; set; }
        internal bool NoCommit { get; set; }
        internal AgreementContact Contact { get; private set; }
    }

    public class ValidateCreateContactPhoneCommand : AbstractValidator<CreateContactPhone>
    {
        public ValidateCreateContactPhoneCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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

            When(x => x.Contact == null, () =>
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
            );

            // type must not exceed max length when provided
            //RuleFor(x => x.Type)
            //    .NotEmpty().WithMessage(MustHaveContactPhoneType.FailMessage)
            //    .Length(1, AgreementContactPhoneConstraints.TypeMaxLength)
            //        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
            //            x => "Contact phone type", x => AgreementContactPhoneConstraints.TypeMaxLength, x => x.Type.Length)
            //;
            //);

            // value is required
            RuleFor(x => x.Value)
                .NotEmpty().WithMessage(MustHaveContactPhoneValue.FailMessage)
                .Length(1, AgreementContactPhoneConstraints.ValueMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Contact phone number", x => AgreementContactPhoneConstraints.ValueMaxLength, x => x.Value.Length)
            ;

        }
    }

    public class HandleCreateContactPhoneCommand : IHandleCommands<CreateContactPhone>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateContactPhoneCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateContactPhone command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new AgreementContactPhone
            {
                Type = command.Type,
                Value = command.Value,
            };

            if (command.Contact != null)
                entity.Owner = command.Contact;
            else
                entity.OwnerId = command.ContactId;

            _entities.Create(entity);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.ContactId,
                    command.Type,
                    command.Value,
                }),
                NewState = entity.ToJsonAudit(),
            };
            _entities.Create(audit);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedContactPhone = entity;
            command.CreatedContactPhoneId = command.CreatedContactPhone.Id;
        }
    }
}
