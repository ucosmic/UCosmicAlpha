using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeleteEmailAddress
    {
        public DeleteEmailAddress(IPrincipal principal, int personId, int emailAddressNumber)
        {
            Principal = principal;
            PersonId = personId;
            EmailAddressNumber = emailAddressNumber;
        }

        public IPrincipal Principal { get; private set; }
        public int PersonId { get; private set; }
        public int EmailAddressNumber { get; private set; }
    }

    public class ValidateDeleteEmailAddressCommand : AbstractValidator<DeleteEmailAddress>
    {
        private readonly IProcessQueries _queries;

        public ValidateDeleteEmailAddressCommand(IProcessQueries queries, IQueryEntities entities)
        {
            _queries = queries;

            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queries)
                .Must(OwnEmailAddress).WithMessage("You are not authorized to delete this email address.")
            ;

            RuleFor(x => x.PersonId)
                .MustFindPersonById(queries)
                .MustFindEmailByPersonIdAndNumber(entities, x => x.EmailAddressNumber)
                .Must(NotBeDefaultEmailAddress).WithMessage("You cannot delete your default email address.")
            ;
        }

        private bool OwnEmailAddress(DeleteEmailAddress command, IPrincipal principal)
        {
            var person = _queries.Execute(new MyPerson(principal));
            return person.RevisionId == command.PersonId;
        }

        private bool NotBeDefaultEmailAddress(DeleteEmailAddress command, int number)
        {
            var emailAddress = _queries.Execute(new MyEmailAddressByNumber(command.Principal, number));
            return emailAddress.IsDefault;
        }
    }

    public class HandleDeleteEmailAddressCommand : IHandleCommands<DeleteEmailAddress>
    {
        private readonly ICommandEntities _entities;

        public HandleDeleteEmailAddressCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(DeleteEmailAddress command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var emailAddress = _entities.Get<EmailAddress>()
                .Single(x => x.PersonId == command.PersonId && x.Number == command.EmailAddressNumber);
            _entities.Purge(emailAddress);
            _entities.SaveChanges();
        }
    }
}
