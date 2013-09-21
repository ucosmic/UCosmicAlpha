using System;
using System.Linq;
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

            var user = _entities.Get<User>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (user == null) { throw new Exception("User not found."); }

            _entities.Purge(user);

            _unitOfWork.SaveChanges();
        }
    }
}
