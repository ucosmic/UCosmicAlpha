using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Identity
{
    public class RevokeRoleFromUser
    {
        public RevokeRoleFromUser(IPrincipal principal, int roleId, int userId)
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

    public class ValidateRevokeRoleFromUserCommand : AbstractValidator<RevokeRoleFromUser>
    {
        public ValidateRevokeRoleFromUserCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                // principal must be authorized to revoke roles
                .MustBeInAnyRole(RoleName.RoleGrantors)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
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

                // each tenant must have at least one security admin
                .MustNotRevokeOnlyGrant(queryProcessor, RoleName.SecurityAdministrator, x => x.Principal, x => x.UserId)
                    .WithMessage(MustNotRevokeOnlyGrant<object>.FailMessageFormat, x => RoleName.SecurityAdministrator)

                // system must always have at least one authorization agent
                .MustNotRevokeOnlyGrant(queryProcessor, RoleName.AuthorizationAgent, x => x.Principal)
                    .WithMessage(MustNotRevokeOnlyGrant<object>.FailMessageFormat, x => RoleName.AuthorizationAgent)

                // cannot remove self from authorization agent role
                .MustNotRevokeOwnGrant(queryProcessor, RoleName.AuthorizationAgent, x => x.Principal, x => x.UserId)
                    .WithMessage(MustNotRevokeOwnGrant<object>.FailMessageFormat, x => RoleName.AuthorizationAgent)
            ;

            When(x => !x.Principal.IsInRole(RoleName.AuthorizationAgent), () =>
            {
                RuleFor(x => x.RoleId)
                    // do not let security admins revoke non-tenant roles
                    .MustBeTenantRole(entities)
                        .WithMessage(MustBeTenantRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.RoleId)

                    // cannot remove self from security admin role
                    .MustNotRevokeOwnGrant(queryProcessor, RoleName.SecurityAdministrator, x => x.Principal, x => x.UserId)
                        .WithMessage(MustNotRevokeOwnGrant<object>.FailMessageFormat, x => RoleName.SecurityAdministrator)
                ;

                RuleFor(x => x.UserId)
                    // do not let security admins revoke from users outside of their tenancy
                    .MustBeTenantUserId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantUserId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserId)
                ;
            });
        }
    }

    public class HandleRevokeRoleFromUserCommand : IHandleCommands<RevokeRoleFromUser>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleRevokeRoleFromUserCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(RevokeRoleFromUser command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var grant = _entities.Get<RoleGrant>().SingleOrDefault(g =>
                g.Role.RevisionId == command.RoleId &&
                g.User.RevisionId == command.UserId);

            if (grant == null) return;
            _entities.Purge(grant);
            _unitOfWork.SaveChanges();
        }
    }
}
