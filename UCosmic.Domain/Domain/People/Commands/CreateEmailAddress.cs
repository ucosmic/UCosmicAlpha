using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.People
{
    public class CreateEmailAddress
    {
        public CreateEmailAddress(string value, int personId)
        {
            Value = value;
            PersonId = personId;
        }

        internal CreateEmailAddress(string value, Person person)
        {
            if (person == null) throw new ArgumentNullException("person");
            Value = value;
            Person = person;
            PersonId = person.RevisionId;
        }

        public int PersonId { get; private set; }
        internal Person Person { get; private set; }
        public string Value { get; private set; }
        public bool IsConfirmed { get; set; }
        public bool IsDefault { get; set; }
        public bool IsFromSaml { get; set; }

        public int CreatedEmailAddressNumber { get; internal set; }
        internal EmailAddress CreatedEmailAddress { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateEmailAddressCommand : AbstractValidator<CreateEmailAddress>
    {
        public ValidateCreateEmailAddressCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // value is required and must be email address
            RuleFor(x => x.Value)
                .NotEmpty().WithMessage(MustNotHaveEmptyEmailAddress.FailMessage)
                .EmailAddress().WithMessage(MustBeValidEmailAddressFormat.FailMessageFormat, x => x.Value)
            ;

            // when Person is null
            When(x => x.Person == null, () => 
                // must find person in the database
                RuleFor(x => x.PersonId)
                    .MustFindPersonById(entities).WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)
            );
        }
    }

    public class HandleCreateEmailAddressCommand : IHandleCommands<CreateEmailAddress>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateEmailAddressCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateEmailAddress command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = command.Person ?? _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Emails,
                })
                .Single(x => x.RevisionId == command.PersonId);

            if (command.IsDefault)
                foreach (var email in person.Emails)
                    email.IsDefault = false;

            var entity = new EmailAddress
            {
                IsConfirmed = command.IsConfirmed,
                IsDefault = command.IsDefault,
                Value = command.Value,
                Number = person.Emails.NextNumber(),
                Person = person,
                IsFromSaml = command.IsFromSaml,
            };
            person.Emails.Add(entity);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.PersonId,
                    command.Value,
                    command.IsConfirmed,
                    command.IsDefault,
                    command.IsFromSaml,
                }),
                NewState = entity.ToJsonAudit(),
            };
            _entities.Create(audit);

            // store
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedEmailAddress = entity;
            command.CreatedEmailAddressNumber = entity.Number;
        }
    }
}
