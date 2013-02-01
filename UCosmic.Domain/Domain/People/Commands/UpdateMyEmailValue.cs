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

            //EmailAddress email = null;

            RuleFor(x => x.Principal)
                // principal cannot be null
                .NotEmpty()
                    //.WithMessage(ValidatePrincipal.FailedBecausePrincipalWasNull)
                    .WithMessage(MustNotHaveEmptyPrincipal.FailMessage)

                // principal identity name cannot be null or whitespace
                //.Must(ValidatePrincipal.IdentityNameIsNotEmpty)
                //    .WithMessage(ValidatePrincipal.FailedBecauseIdentityNameWasEmpty)
                .MustNotHaveEmptyPrincipalIdentityName()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)

                // principal identity name must match User.Name entity property
                //.Must(p => ValidatePrincipal.IdentityNameMatchesUser(p, entities))
                //    .WithMessage(ValidatePrincipal.FailedBecauseIdentityNameMatchedNoUser,
                //        p => p.Principal.Identity.Name)
                .MustFindUserByPrincipal(entities)
                    .WithMessage(MustFindUserByPrincipal.FailMessageFormat, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.Number)
                // number must match email for user
                //.Must((o, p) => ValidateEmailAddress.NumberAndPrincipalMatchesEntity(p, o.Principal, entities, out email))
                //    .When(p => p.Principal != null && p.Principal.Identity.Name != null)
                //    .WithMessage(ValidateEmailAddress.FailedBecauseNumberAndPrincipalMatchedNoEntity,
                //        p => p.Number, p => p.Principal.Identity.Name)
                .MustFindEmailByNumberAndUserName(entities, x => x.Principal.Identity.Name)
                    .WithMessage(MustFindEmailByNumberAndUserName<object>.FailMessageFormat, 
                        x => x.Number, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.NewValue)
                // new email address cannot be empty
                .NotEmpty()
                    //.WithMessage(ValidateEmailAddress.FailedBecauseValueWasEmpty)
                    .WithMessage(MustNotHaveEmptyEmailAddress.FailMessage)

                // must be valid against email address regular expression
                .EmailAddress()
                    //.WithMessage(ValidateEmailAddress.FailedBecauseValueWasNotValidEmailAddress,
                    //    p => p.NewValue)
                    .WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.NewValue)

                // must match previous spelling case insensitively
                .MustEqualEmailValueCaseInsensitively(entities, x => x.Number, x => x.Principal.Identity.Name)
                    .WithMessage(MustEqualEmailValueCaseInsensitively<object>.FailMessageFormat, x => x.NewValue)

            ;

            //RuleFor(x => x.NewValue)
            //    // must match previous spelling case insensitively
            //    .Must(p => ValidateEmailAddress.NewValueMatchesCurrentValueCaseInsensitively(p, email))
            //    .When(p => email != null)
            //        .WithMessage(ValidateEmailAddress.FailedBecauseNewValueDidNotMatchCurrentValueCaseInvsensitively,
            //            p => p.NewValue)
            //;
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
