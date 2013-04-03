using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Identity
{
    public class GrantRoleToUser
    {
        public GrantRoleToUser(IPrincipal principal, int roleId, int userId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            RoleId = roleId;
            UserId = userId;
        }

        public IPrincipal Principal { get; private set; }
        public int RoleId { get; private set; }
        public int UserId { get; private set; }
    }

    public class ValidateGrantRoleToUserCommand : AbstractValidator<GrantRoleToUser>
    {
        public ValidateGrantRoleToUserCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to grant roles
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .Must(principal => principal.IsInAnyRole(RoleName.RoleGrantors))
                    .WithMessage(MustBeAuthorized.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;
            RuleFor(x => x.Principal.Identity.Name)
                // principal.identity.name cannot be null or empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)

                // principal.identity.name must match User.Name entity property
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.UserId)
                .MustFindUserById(entities)
                    .WithMessage(MustFindUserById.FailMessageFormat, x => x.UserId)
            ;

            RuleFor(x => x.RoleId)
                .MustFindRoleById(entities)
                    .WithMessage(MustFindRoleById.FailMessageFormat, x => x.RoleId)
            ;
            RuleFor(x => x)
                .Must(command =>
                {
                    if (!command.Principal.IsInRole(RoleName.AuthorizationAgent))
                    {
                        // do not let security admins add to non-tenant roles
                        var roleToGrant = entities.Query<Role>().Single(x => x.RevisionId == command.RoleId);
                        if (RoleName.NonTenantRoles.Contains(roleToGrant.Name)) return false;

                        // do not let security admins grant to users outside of their tenancy
                        var tenantUserIds = queryProcessor.Execute(new MyUsers(command.Principal)).Select(x => x.RevisionId);
                        var userToGrant = entities.Query<User>().Single(x => x.RevisionId == command.UserId);
                        if (!tenantUserIds.Contains(userToGrant.RevisionId)) return false;
                    }

                    return true;
                })
                .WithName(typeof(GrantRoleToUser).Name)
                .WithMessage(MustBeAuthorized.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;
        }
    }

    public class HandleGrantRoleToUserCommand : IHandleCommands<GrantRoleToUser>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleGrantRoleToUserCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(GrantRoleToUser command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var role = _entities.Get<Role>()
                .EagerLoad(_entities, new Expression<Func<Role, object>>[]
                {
                    r => r.Grants,
                })
                .SingleOrDefault(x => x.RevisionId == command.RoleId);
            if (role == null)
                throw new InvalidOperationException(string.Format(MustFindRoleById.FailMessageFormat, command.RoleId));

            var grant = role.Grants.SingleOrDefault(x => x.User.RevisionId == command.UserId);
            if (grant != null) return;

            var user = _entities.Get<User>().SingleOrDefault(x => x.RevisionId == command.UserId);
            grant = new RoleGrant
            {
                Role = role,
                User = user,
            };
            _entities.Create(grant);
            _unitOfWork.SaveChanges();
        }
    }
}
