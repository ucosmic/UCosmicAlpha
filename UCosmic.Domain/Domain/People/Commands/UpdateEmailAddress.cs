using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.People
{
    public class UpdateEmailAddress
    {
        public UpdateEmailAddress(int personId, int number)
        {
            PersonId = personId;
            Number = number;
        }

        internal UpdateEmailAddress(EmailAddress emailAddress)
        {
            if (emailAddress == null) throw new ArgumentNullException("emailAddress");
            EmailAddress = emailAddress;
            PersonId = emailAddress.PersonId;
            Number = emailAddress.Number;
        }

        public int PersonId { get; private set; }
        public int Number { get; private set; }
        internal EmailAddress EmailAddress { get; private set; }
        public string Value { get; set; }
        public bool IsConfirmed { get; set; }
        public bool IsDefault { get; set; }
        public bool IsFromSaml { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateEmailAddressCommand : AbstractValidator<UpdateEmailAddress>
    {
        public ValidateUpdateEmailAddressCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // value is required and must be email address when provided
            When(x => !string.IsNullOrWhiteSpace(x.Value), () =>
                RuleFor(x => x.Value)
                    .EmailAddress().WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.Value)
            );

            // when EmailAddress is null
            When(x => x.EmailAddress == null, () =>
                RuleFor(x => x.PersonId)
                    // must find person in the database
                    .MustFindPersonById(entities)
                        .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)

                    // must find email in the database
                    .MustFindEmailByPersonIdAndNumber(entities, x => x.Number)
                        .WithMessage(MustFindEmailByPersonIdAndNumber<object>.FailMessageFormat, x => x.PersonId, x => x.Number)
            );
        }
    }

    public class HandleUpdateEmailAddressCommand : IHandleCommands<UpdateEmailAddress>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateEmailAddressCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateEmailAddress command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load entity
            var entity = command.EmailAddress ?? _entities.Get<EmailAddress>()
                .EagerLoad(_entities, new Expression<Func<EmailAddress, object>>[]
                {
                    x => x.Person,
                })
                .Single(x => x.PersonId == command.PersonId && x.Number == command.Number);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.PersonId,
                    command.Number,
                    command.Value,
                    command.IsConfirmed,
                    command.IsDefault,
                    command.IsFromSaml,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            // clear previous default email
            if (command.IsDefault)
                foreach (var email in entity.Person.Emails.Where(x => x.IsDefault && x.Number != command.Number))
                    Handle(new UpdateEmailAddress(email)
                    {
                        NoCommit = true,
                        IsDefault = false,
                        IsConfirmed = email.IsConfirmed,
                        IsFromSaml = email.IsFromSaml,
                        Value = email.Value,
                    });

            // update scalars
            if (!string.IsNullOrWhiteSpace(command.Value))
                entity.Value = command.Value;
            entity.IsConfirmed = command.IsConfirmed;
            entity.IsDefault = command.IsDefault;
            entity.IsFromSaml = command.IsFromSaml;
            _entities.Update(entity);

            audit.NewState = entity.ToJsonAudit();
            _entities.Create(audit);

            // store
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
