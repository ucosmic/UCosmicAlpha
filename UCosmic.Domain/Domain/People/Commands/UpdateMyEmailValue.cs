using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateMyEmailValue
    {
        public IPrincipal Principal { get; set; }
        public int Number { get; set; }
        public string NewValue { get; set; }
        public bool ChangedState { get; internal set; }
    }

    public class ValidateUpdateMyEmailValueCommand : AbstractValidator<UpdateMyEmailValue>
    {
        public ValidateUpdateMyEmailValueCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                // principal cannot be null
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)

                // principal identity name cannot be null or whitespace
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)

                // principal identity name must match User.Name entity property
                .MustFindUserByPrincipal(entities)
            ;

            RuleFor(x => x.Number)
                // number must match email for user
                .MustFindEmailByNumberAndUserName(entities, x => x.Principal.Identity.Name)
                    .WithMessage(MustFindEmailByNumberAndUserName<object>.FailMessageFormat, 
                        x => x.Number, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.NewValue)
                // new email address cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyEmailAddress.FailMessage)

                // must be valid against email address regular expression
                .EmailAddress()
                    .WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.NewValue)

                // must match previous spelling case insensitively
                .MustEqualEmailValueCaseInsensitively(entities, x => x.Number, x => x.Principal.Identity.Name)
                    .WithMessage(MustEqualEmailValueCaseInsensitively<object>.FailMessageFormat, x => x.NewValue)

            ;
        }
    }

    public class HandleUpdateMyEmailValueCommand : IHandleCommands<UpdateMyEmailValue>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateMyEmailValueCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateMyEmailValue command)
        {
            if (command == null) throw new ArgumentNullException("command");

            command.ChangedState = false;

            // get the email address
            var email = _entities.Get<EmailAddress>()
                .ByUserNameAndNumber(command.Principal.Identity.Name, command.Number);

            // only process matching email
            if (email == null) return;

            // only update the value if it was respelled
            if (email.Value == command.NewValue) return;

            email.Value = command.NewValue;
            _entities.Update(email);
            command.ChangedState = true;
        }
    }
}
