using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Agreements
{
    public class UpdateContact
    {
        public UpdateContact(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int ContactId { get; set; }
        public int AgreementId { get; set; }
        public string Type { get; set; }
        public int? PersonId { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string EmailAddress { get; set; }
        public string JobTitle { get; set; }
    }

    public class ValidateUpdateContactCommand : AbstractValidator<UpdateContact>
    {
        public ValidateUpdateContactCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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

                // contact id must exist under this agreement
                .MustOwnContactWithId(entities, x => x.ContactId)
                    .WithMessage(MustOwnContactWithId<object>.FailMessageFormat, x => x.AgreementId, x => x.ContactId)
            ;

            // type must meet length requirements when provided
            When(x => !string.IsNullOrWhiteSpace(x.Type), () =>
                RuleFor(x => x.Type)
                    .Length(1, AgreementContactConstraints.TypeMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Contact type", x => AgreementContactConstraints.TypeMaxLength, x => x.Type.Length)
            );

            // when personid is present
            When(x => x.PersonId.HasValue, () =>
                // the person must exist in the database
                RuleFor(x => x.PersonId.Value)
                    .MustFindPersonById(entities)
                        .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)
            );

            // when personid is notpresent
            When(x => !x.PersonId.HasValue, () =>
            {
                // first and last name are required
                RuleFor(x => x.FirstName).NotEmpty().WithMessage(MustHaveFirstName.FailMessage);
                RuleFor(x => x.LastName).NotEmpty().WithMessage(MustHaveLastName.FailMessage);

                // other name fields cannot exceed length
                When(x => !string.IsNullOrWhiteSpace(x.Salutation), () => 
                    RuleFor(x => x.Salutation)
                        .Length(1, PersonConstraints.SalutationMaxLength)
                            .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                                x => "Salutation", x => PersonConstraints.SalutationMaxLength, x => x.Salutation.Length)
                );
                When(x => !string.IsNullOrWhiteSpace(x.MiddleName), () =>
                    RuleFor(x => x.MiddleName)
                        .Length(1, PersonConstraints.MiddleNameMaxLength)
                            .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                                x => "Middle name", x => PersonConstraints.MiddleNameMaxLength, x => x.MiddleName.Length)
                );
                When(x => !string.IsNullOrWhiteSpace(x.Suffix), () =>
                    RuleFor(x => x.Suffix)
                        .Length(1, PersonConstraints.SuffixMaxLength)
                            .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                                x => "Suffix", x => PersonConstraints.SuffixMaxLength, x => x.Suffix.Length)
                );
                When(x => !string.IsNullOrWhiteSpace(x.EmailAddress), () =>
                    RuleFor(x => x.EmailAddress)
                        .EmailAddress()
                            .WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat,
                                x => x.EmailAddress)
                        .Length(1, EmailAddressConstraints.ValueMaxLength)
                            .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                                x => "Email address", x => EmailAddressConstraints.ValueMaxLength, x => x.EmailAddress.Length)
                );
            });

            // title must meet length requirements
            When(x => !string.IsNullOrWhiteSpace(x.JobTitle), () =>
                RuleFor(x => x.JobTitle)
                    .Length(1, AgreementContactConstraints.TitleMaxLength)
                        .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                            x => "Job title", x => AgreementContactConstraints.TitleMaxLength, x => x.JobTitle.Length)
            );
        }
    }

    public class HandleUpdateContactCommand : IHandleCommands<UpdateContact>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdatePerson> _updatePerson;
        private readonly IHandleCommands<UpdateEmailAddress> _updateEmail;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateContactCommand(ICommandEntities entities
            , IHandleCommands<UpdatePerson> updatePerson
            , IHandleCommands<UpdateEmailAddress> updateEmail
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _updatePerson = updatePerson;
            _updateEmail = updateEmail;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateContact command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementContact>()
                .EagerLoad(_entities, new Expression<Func<AgreementContact, object>>[]
                {
                    x => x.Person.Emails,
                    x => x.Person.User,
                })
                .Single(x => x.Id == command.ContactId && x.AgreementId == command.AgreementId);

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
                    command.PersonId,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.EmailAddress,
                    command.JobTitle,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            // update fields
            if (!string.IsNullOrWhiteSpace(command.Type))
                entity.Type = command.Type;
            entity.Title = command.JobTitle;
            entity.UpdatedByPrincipal = command.Principal.Identity.Name;
            entity.UpdatedOnUtc = DateTime.UtcNow;

            // change to different person
            if (command.PersonId.HasValue && command.PersonId.Value != entity.PersonId)
            {
                entity.PersonId = command.PersonId.Value;
            }

            // update existing person only if they have no user account
            else if (entity.Person.User == null)
            {
                _updatePerson.Handle(new UpdatePerson(command.Principal, entity.PersonId)
                {
                    NoCommit = true,
                    Salutation = command.Salutation,
                    FirstName = command.FirstName,
                    MiddleName = command.MiddleName,
                    LastName = command.LastName,
                    Suffix = command.Suffix,
                    IsDisplayNameDerived = true,
                });

                // creating contact uses default email, so updating does as well
                if (!string.IsNullOrWhiteSpace(command.EmailAddress))
                {
                    var defaultEmail = entity.Person.Emails.SingleOrDefault(x => x.IsDefault);
                    if (defaultEmail != null)
                        _updateEmail.Handle(new UpdateEmailAddress(defaultEmail)
                        {
                            NoCommit = true,
                            Value = command.EmailAddress,
                            IsConfirmed = defaultEmail.IsConfirmed,
                            IsDefault = defaultEmail.IsDefault,
                            IsFromSaml = defaultEmail.IsFromSaml,
                        });
                }
            }

            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(entity);
            _unitOfWork.SaveChanges();
        }
    }
}
