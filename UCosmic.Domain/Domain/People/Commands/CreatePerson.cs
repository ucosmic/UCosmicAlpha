using System;
using System.Linq;
using FluentValidation;

namespace UCosmic.Domain.People
{
    public class CreatePerson
    {
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public EmailAddress[] EmailAddresses { get; set; }
        public string Gender { get; set; }

        internal Person CreatedPerson { get; set; }
        public int CreatedPersonId { get; internal set; }

        public class EmailAddress
        {
            public string Value { get; set; }
            public bool IsConfirmed { get; set; }
            public bool IsDefault { get; set; }
        }

        internal bool NoCommit { get; set; }
    }

    public class ValidateCreatePersonCommand : AbstractValidator<CreatePerson>
    {
        public ValidateCreatePersonCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when first and last name are not provided, display name cannot be empty
            When(x => string.IsNullOrWhiteSpace(x.FirstName) || string.IsNullOrWhiteSpace(x.LastName), () =>
                RuleFor(x => x.DisplayName)
                    // display name cannot be empty
                    .NotEmpty()
                        .WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            );
        }
    }

    public class HandleCreatePersonCommand : IHandleCommands<CreatePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreatePersonCommand(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreatePerson command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the person
            var person = new Person
            {
                DisplayName = command.DisplayName,
                Salutation = command.Salutation,
                FirstName = command.FirstName,
                MiddleName = command.MiddleName,
                LastName = command.LastName,
                Suffix = command.Suffix,
                Gender = command.Gender,
            };

            if (string.IsNullOrWhiteSpace(person.DisplayName))
            {
                person.DisplayName = _queryProcessor.Execute(new GenerateDisplayName
                {
                    Salutation = command.Salutation,
                    FirstName = command.FirstName,
                    MiddleName = command.MiddleName,
                    LastName = command.LastName,
                    Suffix = command.Suffix,
                });
            }

            // attach email addresses
            if (command.EmailAddresses != null && command.EmailAddresses.Any())
            {
                foreach (var emailAddress in command.EmailAddresses
                    .OrderByDescending(e => e.IsDefault)
                    .ThenByDescending(e => e.IsConfirmed)
                    .ThenBy(e => e.Value)
                )
                {
                    var emailEntity = person.AddEmail(emailAddress.Value);
                    emailEntity.IsConfirmed = emailAddress.IsConfirmed;
                }
            }

            // store
            _entities.Create(person);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedPerson = person;
            command.CreatedPersonId = person.RevisionId;
        }
    }
}
