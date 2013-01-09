using System;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class CreatePerson
    {
        public string DisplayName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public bool UserIsRegistered { get; set; }
        public EmailAddress[] EmailAddresses { get; set; }
        public Person CreatedPerson { get; internal set; }
        public string Gender { get; set; }

        public class EmailAddress
        {
            public string Value { get; set; }
            public bool IsConfirmed { get; set; }
            public bool IsDefault { get; set; }
        }
    }

    public class ValidateCreatePersonCommand : AbstractValidator<CreatePerson>
    {
        public ValidateCreatePersonCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(p => p.DisplayName)
                // display name cannot be empty
                .NotEmpty()
                    .WithMessage(ValidatePerson.FailedBecauseDisplayNameWasEmpty)
            ;

            RuleFor(p => p.UserName)
                // if username is present, validate that it is not attached to another person
                .Must(p => ValidateUser.NameMatchesNoEntity(p, queryProcessor))
                    .WithMessage(ValidateUser.FailedBecauseNameMatchedEntity,
                        p => p.UserName)
            ;
        }
    }

    public class HandleCreatePersonCommand : IHandleCommands<CreatePerson>
    {
        private readonly ICommandEntities _entities;

        public HandleCreatePersonCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreatePerson command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the person
            var person = new Person
            {
                FirstName = command.FirstName,
                LastName = command.LastName,
                DisplayName = command.DisplayName,
                Gender = command.Gender
            };

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

            // attach a user if commanded
            if (!string.IsNullOrWhiteSpace(command.UserName))
                person.User = new User
                {
                    Name = command.UserName,
                    IsRegistered = command.UserIsRegistered,
                };

            // store
            _entities.Create(person);

            command.CreatedPerson = person;
        }
    }
}
