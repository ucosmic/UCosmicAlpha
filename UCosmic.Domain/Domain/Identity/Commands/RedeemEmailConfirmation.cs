using System;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class RedeemEmailConfirmation
    {
        public Guid Token { get; set; }
        public string SecretCode { get; set; }
        public EmailConfirmationIntent Intent { get; set; }
        public string Ticket { get; internal set; }
    }

    public class ValidateRedeemEmailConfirmationCommand : AbstractValidator<RedeemEmailConfirmation>
    {
        private readonly EntityWrapper<EmailConfirmation> _confirmation = new EntityWrapper<EmailConfirmation>();

        public ValidateRedeemEmailConfirmationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Token)
                // token cannot be an empty guid
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyConfirmationToken.FailMessageFormat, x => x.Token)

                // token must match a confirmation
                .MustFindConfirmationByToken(entities, _confirmation)
                    .WithMessage(MustFindConfirmationByToken.FailMessageFormat, x => x.Token)

                // it cannot be expired
                .Must(x => !_confirmation.Entity.IsExpired)
                    .WithMessage(MustNotBeExpiredConfirmation.FailMessageFormat,
                        x => x.Token, x => _confirmation.Entity.ExpiresOnUtc)

                // it cannot be retired
                .Must(x => !_confirmation.Entity.IsRetired)
                    .WithMessage(MustNotBeRetiredConfirmation.FailMessageFormat,
                        x => x.Token, x => _confirmation.Entity.RetiredOnUtc)
            ;

            RuleFor(x => x.SecretCode)
                // secret cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptySecretCode.FailMessage)

                // secret must match entity
                .Must(x => x == _confirmation.Entity.SecretCode)
                    .WithMessage(MustHaveCorrectSecretCode.FailMessageFormat,
                        x => x.SecretCode, x => x.Token)
            ;

            RuleFor(x => x.Intent)
                // intent must match entity
                .Must(x => x == _confirmation.Entity.Intent)
                    .WithMessage(MustHaveCorrectConfirmationIntent.FailMessageFormat,
                        x => x.Intent, x => x.Token)
            ;
        }
    }

    public class HandleRedeemEmailConfirmationCommand : IHandleCommands<RedeemEmailConfirmation>
    {
        private readonly ICommandEntities _entities;

        public HandleRedeemEmailConfirmationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(RedeemEmailConfirmation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the confirmation
            var confirmation = _entities.Get<EmailConfirmation>()
                .EagerLoad(_entities, new Expression<Func<EmailConfirmation, object>>[]
                {
                    c => c.EmailAddress
                })
                .ByToken(command.Token);

            // redeem
            if (!confirmation.RedeemedOnUtc.HasValue)
            {
                confirmation.EmailAddress.IsConfirmed = true;
                confirmation.RedeemedOnUtc = DateTime.UtcNow;
                confirmation.Ticket = HandleGenerateRandomSecretQuery.Handle(
                    new GenerateRandomSecret(256));
                _entities.Update(confirmation);
            }

            command.Ticket = confirmation.Ticket;
        }
    }
}
