using System;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class SendConfirmEmailMessage
    {
        public string EmailAddress { get; set; }
        public EmailConfirmationIntent Intent { get; set; }
        public string SendFromUrl { get; set; }

        internal EmailTemplateName TemplateName
        {
            get
            {
                switch (Intent)
                {
                    case EmailConfirmationIntent.ResetPassword:
                        return EmailTemplateName.ResetPasswordConfirmation;

                    case EmailConfirmationIntent.CreatePassword:
                        return EmailTemplateName.CreatePasswordConfirmation;
                }
                throw new NotSupportedException(string.Format(
                    "Email confirmation intent '{0}' is not supported.",
                        Intent));
            }
        }
        public Guid ConfirmationToken { get; internal set; }
    }

    public class ValidateSendConfirmEmailMessageCommand : AbstractValidator<SendConfirmEmailMessage>
    {
        private readonly EntityWrapper<Person> _person = new EntityWrapper<Person>();
        private readonly EntityWrapper<Establishment> _establishment = new EntityWrapper<Establishment>();

        public ValidateSendConfirmEmailMessageCommand(IQueryEntities entities, IStorePasswords passwords)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EmailAddress)
                //cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyEmailAddress.FailMessage)

                // must be valid against email address regular expression
                .EmailAddress()
                    .WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.EmailAddress)

                // must match a person
                .MustFindPersonByEmail(entities, _person)
                    .WithMessage(MustFindPersonByEmail.FailMessageFormat, x => x.EmailAddress)

                // must match an establishment
                .MustFindEstablishmentByEmail(entities, _establishment)
                    .WithMessage(MustFindEstablishmentByEmail.FailMessageFormat,
                        x => x.EmailAddress)

                // establishment must be a member
                .Must(x => _establishment.Entity.IsMember)
                    .WithMessage(MustBeMemberEstablishment.FailMessageFormat,
                        x => _establishment.Entity.RevisionId)
            ;

            // when person is not null and intent is to reset password,
            When(x => _person.Entity != null && x.Intent == EmailConfirmationIntent.ResetPassword, () =>
                RuleFor(x => x.EmailAddress)
                    // the establishment must not have saml sign on
                    .Must(x => !_establishment.Entity.HasSamlSignOn())
                        .WithMessage(MustNotHaveSamlIntegration.FailMessageFormat,
                            x => _establishment.Entity.RevisionId)

                    // the matched person must have a user
                    .Must(x => _person.Entity.User != null)
                        .WithMessage(MustNotHaveNullUser.FailMessageFormat,
                            x => _person.Entity.DisplayName)

                    // the user must not have a SAML account
                    .Must(x => string.IsNullOrWhiteSpace(_person.Entity.User.EduPersonTargetedId))
                        .WithMessage(MustNotHaveSamlMembershipAccount.FailMessageFormat,
                            x => _person.Entity.User.Name)

                    // the email address' person's user's name must match a local member account
                    .Must(x => passwords.Exists(_person.Entity.User.Name))
                        .WithMessage(MustHaveLocalMembershipAccount.FailMessageFormat,
                            x => _person.Entity.User.Name)

                    // the email address must be confirmed
                    .Must(x => _person.Entity.GetEmail(x).IsConfirmed)
                        .WithMessage(MustBeConfirmedEmailAddress.FailMessageFormat,
                            x => x.EmailAddress)
            );
        }
    }

    public class HandleSendConfirmEmailMessageCommand : IHandleCommands<SendConfirmEmailMessage>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<SendEmailMessageCommand> _sendHandler;

        public HandleSendConfirmEmailMessageCommand(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<SendEmailMessageCommand> sendHandler
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _sendHandler = sendHandler;
        }

        public void Handle(SendConfirmEmailMessage command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the person
            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Emails,
                })
                .ByEmail(command.EmailAddress);

            // get the email
            var email = person.GetEmail(command.EmailAddress);

            // create the confirmation
            var secretCode = HandleGenerateRandomSecretQuery.Handle(
                new GenerateRandomSecret(12));
            var confirmation = new EmailConfirmation(command.Intent)
            {
                EmailAddress = email,
                SecretCode = secretCode,
            };
            command.ConfirmationToken = confirmation.Token;
            _entities.Create(confirmation);

            // get the email template
            var template = _queryProcessor.Execute(
                new EmailTemplateByName(command.TemplateName.AsSentenceFragment()));

            // create the message
            var message = _queryProcessor.Execute(
                new ComposeEmailMessage(template, email)
                {
                    Formatters = _queryProcessor.Execute(
                        new ConfirmEmailFormatters(confirmation, command.SendFromUrl)
                    )
                }
            );
            _entities.Create(message);

            // send the message
            _sendHandler.Handle(
                new SendEmailMessageCommand
                {
                    PersonId = message.ToPerson.RevisionId,
                    MessageNumber = message.Number,
                }
            );
        }
    }
}
