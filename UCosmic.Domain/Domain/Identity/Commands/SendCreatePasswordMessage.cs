﻿using System;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class SendCreatePasswordMessage
    {
        public string EmailAddress { get; set; }
        public string SendFromUrl { get; set; }
        public Guid ConfirmationToken { get; internal set; }
    }

    public class ValidateSendCreatePasswordMessageCommand : AbstractValidator<SendCreatePasswordMessage>
    {
        private readonly EntityWrapper<Person> _person = new EntityWrapper<Person>();
        private readonly EntityWrapper<Establishment> _establishment = new EntityWrapper<Establishment>();

        public ValidateSendCreatePasswordMessageCommand(IQueryEntities entities, IStorePasswords passwords)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EmailAddress)
                // email address cannot be empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyEmailAddress.FailMessage)

                // must be valid against email address regular expression
                .EmailAddress()
                    .WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.EmailAddress)

                // the email address must match an establishment
                .MustFindEstablishmentByEmail(entities, _establishment)
                    .WithMessage(MustFindEstablishmentByEmail.FailMessageFormat,
                        x => x.EmailAddress)

                // establishment must be a member
                .Must(x => _establishment.Entity.IsMember)
                    .WithMessage(MustBeMemberEstablishment.FailMessageFormat,
                        x => _establishment.Entity.RevisionId)

                // establishment must not have saml sign on
                .Must(x => !_establishment.Entity.HasSamlSignOn())
                    .WithMessage(MustNotHaveSamlIntegration.FailMessageFormat,
                        x => _establishment.Entity.RevisionId)

                // the email address MAY match a person
                .Must((command, x, context) =>
                {
                    var validator = new MustFindPersonByEmail(entities, _person);
                    validator.Validate(context);
                    return true;
                })
            ;

            // when person is not null,
            When(x => _person.Entity != null, () =>
                RuleFor(x => x.EmailAddress)
                    // it must not have a registered user
                    .Must(x => _person.Entity.User == null || !_person.Entity.User.IsRegistered)
                        .WithMessage(MustNotBeRegisteredUser.FailMessageFormat,
                            x => _person.Entity.DisplayName)

                    // it must not have a local member account
                    .Must(x => _person.Entity.User == null || !passwords.Exists(_person.Entity.User.Name))
                        .WithMessage(MustNotHaveLocalMembershipAccount.FailMessageFormat,
                            x => _person.Entity.User.Name)
            );
        }
    }

    public class HandleSendCreatePasswordMessageCommand : IHandleCommands<SendCreatePasswordMessage>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<SendConfirmEmailMessage> _sendHandler;
        private readonly IHandleCommands<CreatePerson> _createPersonHandler;
        private readonly IHandleCommands<CreateEmailAddress> _createEmailHandler;
        private readonly IUnitOfWork _unitOfWork;

        public HandleSendCreatePasswordMessageCommand(ICommandEntities entities
            , IHandleCommands<SendConfirmEmailMessage> sendHandler
            , IHandleCommands<CreatePerson> createPersonHandler
            , IHandleCommands<CreateEmailAddress> createEmailHandler
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _sendHandler = sendHandler;
            _createPersonHandler = createPersonHandler;
            _createEmailHandler = createEmailHandler;
            _unitOfWork = unitOfWork;
        }

        public void Handle(SendCreatePasswordMessage command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the establishment
            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    e => e.Type.Category,
                })
                .ByEmail(command.EmailAddress);

            // get the person
            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Emails,
                    x => x.Affiliations,
                })
                .ByEmail(command.EmailAddress);

            // create the person if they don't yet exist
            if (person == null)
            {
                var createPersonCommand = new CreatePerson
                {
                    DisplayName = command.EmailAddress,
                    NoCommit = true,
                };
                _createPersonHandler.Handle(createPersonCommand);
                person = createPersonCommand.CreatedPerson;
            }

            // affiliate person with establishment
            person.AffiliateWith(establishment);

            // add email address if necessary
            if (person.Emails.ByValue(command.EmailAddress) == null)
                _createEmailHandler.Handle(new CreateEmailAddress(command.EmailAddress, person)
                {
                    NoCommit = true,
                });
                //person.AddEmail(command.EmailAddress);

            // save changes so nested command can find the correct data
            _unitOfWork.SaveChanges();

            // send the message
            var sendCommand = new SendConfirmEmailMessage
            {
                EmailAddress = command.EmailAddress,
                Intent = EmailConfirmationIntent.CreatePassword,
                SendFromUrl = command.SendFromUrl,
            };
            _sendHandler.Handle(sendCommand);
            command.ConfirmationToken = sendCommand.ConfirmationToken;
        }
    }
}
