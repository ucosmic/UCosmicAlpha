using System;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class ResetPassword
    {
        public Guid Token { get; set; }
        public string Ticket { get; set; }
        public string Password { get; set; }
        public string PasswordConfirmation { get; set; }
    }

    public class ValidateResetPasswordCommand : AbstractValidator<ResetPassword>
    {
        private readonly EntityWrapper<EmailConfirmation> _confirmation = new EntityWrapper<EmailConfirmation>();

        public ValidateResetPasswordCommand(IQueryEntities entities, IStorePasswords passwords)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Token)
                // token cannot be an empty guid
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyConfirmationToken.FailMessageFormat, x => x.Token)

                // token must match a confirmation
                .MustFindConfirmationByToken(entities, _confirmation)
                    .WithMessage(MustFindConfirmationByToken.FailMessageFormat, x => x.Token)

                // its intent must be to reset password
                .Must(x => _confirmation.Entity.Intent == EmailConfirmationIntent.ResetPassword)
                    .WithMessage(MustHaveCorrectConfirmationIntent.FailMessageFormat,
                        x => _confirmation.Entity.Intent, x => x.Token)

                // it cannot be expired
                .Must(x => !_confirmation.Entity.IsExpired)
                    .WithMessage(MustNotBeExpiredConfirmation.FailMessageFormat,
                        x => x.Token, x => _confirmation.Entity.ExpiresOnUtc)

                // it cannot be retired
                .Must(x => !_confirmation.Entity.IsRetired)
                    .WithMessage(MustNotBeRetiredConfirmation.FailMessageFormat,
                        x => x.Token, x => _confirmation.Entity.RetiredOnUtc)

                // it must be redeemed
                .Must(x => _confirmation.Entity.IsRedeemed)
                    .WithMessage(MustBeRedeemedConfirmation.FailMessageFormat,
                        x => x.Token)

                // email address must be confirmed
                .Must(x => _confirmation.Entity.EmailAddress.IsConfirmed)
                    .WithMessage(MustBeConfirmedEmailAddress.FailMessageFormat,
                        x => _confirmation.Entity.EmailAddress.Value)

                // it must be attached to a user
                .Must(x => _confirmation.Entity.EmailAddress.Person.User != null)
                    .WithMessage(MustNotHaveNullUser.FailMessageFormat,
                        x => _confirmation.Entity.EmailAddress.Person.DisplayName)

                // user cannot have a saml account
                .Must(x => string.IsNullOrWhiteSpace(_confirmation.Entity.EmailAddress.Person.User.EduPersonTargetedId))
                    .WithMessage(MustNotHaveSamlMembershipAccount.FailMessageFormat,
                        x => _confirmation.Entity.EmailAddress.Person.User.Name)

                // user name must match local member account
                .Must(x => passwords.Exists(_confirmation.Entity.EmailAddress.Person.User.Name))
                    .WithMessage(MustHaveLocalMembershipAccount.FailMessageFormat,
                        x => _confirmation.Entity.EmailAddress.Person.User.Name)
            ;

            RuleFor(x => x.Ticket)
                // ticket cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyConfirmationTicket.FailMessage)

                // must match the entity ticket
                .Must(x => x == _confirmation.Entity.Ticket)
                    .WithMessage(MustHaveCorrectConfirmationTicket.FailMessageFormat,
                        x => x.Ticket, x => x.Token)
            ;

            RuleFor(x => x.Password)
                // cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPassword.FailMessage)

                // length must be between 6 and 100 characters
                .Length(passwords.MinimumPasswordLength, int.MaxValue)
                    .WithMessage(MustHaveMinimumPasswordLength.FormatFailMessage(passwords.MinimumPasswordLength))
            ;

            RuleFor(x => x.PasswordConfirmation)
                // cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPasswordConfirmation.FailMessage)

                // must match password
                .Equal(x => x.Password)
                    .WithMessage(MustHaveTwoEqualPasswords.FailMessage)
            ;
        }
    }

    public class HandleResetPasswordCommand : IHandleCommands<ResetPassword>
    {
        private readonly ICommandEntities _entities;
        private readonly IStorePasswords _passwords;

        public HandleResetPasswordCommand(ICommandEntities entities
            , IStorePasswords passwords
        )
        {
            _entities = entities;
            _passwords = passwords;
        }

        public void Handle(ResetPassword command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the confirmation
            var confirmation = _entities.Get<EmailConfirmation>()
                .ByToken(command.Token);

            _passwords.Reset(confirmation.EmailAddress.Person.User.Name, command.Password);
            confirmation.RetiredOnUtc = DateTime.UtcNow;
            confirmation.SecretCode = null;
            confirmation.Ticket = null;
            _entities.Update(confirmation);
        }
    }
}
