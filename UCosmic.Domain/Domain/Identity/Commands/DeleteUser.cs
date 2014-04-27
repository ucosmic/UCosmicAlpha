using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Identity
{
    public class DeleteUser
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }

        public DeleteUser(IPrincipal principal, int id)
        {
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteUserCommand : AbstractValidator<DeleteUser>
    {
        public ValidateDeleteUserCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(entities)
                .MustNotBeSameUser(entities, x => x.Id)
                    .WithMessage(MustNotBeSameUser<object>.FailMessageFormat, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.Id)
                .MustFindUserById(entities)
                .MustBeTenantUserId(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeTenantUserId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.Id)
            ;
        }
    }

    public class HandleDeleteUserCommand : IHandleCommands<DeleteUser>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteUserCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteUser command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var user = _entities.Get<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations,
                })
                .Single(a => a.RevisionId == command.Id);

            // when deleting a user, we also want to disassociate their person from tenancy
            var person = user.Person;
            if (person != null)
            {
                person.IsActive = false;
                if (person.DefaultAffiliation != null)
                    person.DefaultAffiliation.IsDefault = false;

                //to recreate a user with the same email address we have to delete the current emails.
                //just deleting the default email address for now
                _entities.Purge(person.Emails.SingleOrDefault(x => x.IsDefault));
                //xx = person.Emails.SingleOrDefault(x => x.IsDefault == false);
                //xx = xx;
            }


            
            _entities.Purge(user);
            _unitOfWork.SaveChanges();
        }
    }
}
