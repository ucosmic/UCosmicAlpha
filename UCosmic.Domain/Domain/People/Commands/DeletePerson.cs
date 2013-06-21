using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeletePerson
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }

        public DeletePerson(IPrincipal principal, int id)
        {
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeletePersonCommand : AbstractValidator<DeletePerson>
    {
        public ValidateDeletePersonCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal.Identity.Name)
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
                .MustNotBeSamePerson(entities, x => x.Id)
                    .WithMessage(MustNotBeSamePerson<object>.FailMessageFormat, x => x.Principal.Identity.Name)
            ;
        }
    }

    public class HandleDeletePersonCommand : IHandleCommands<DeletePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeletePersonCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeletePerson command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (person == null) { throw new Exception("Person not found."); }

            _entities.Purge(person);

            _unitOfWork.SaveChanges();
        }
    }
}
