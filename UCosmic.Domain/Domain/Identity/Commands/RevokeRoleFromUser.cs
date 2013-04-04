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

            // principal must be authorized to revoke roles
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
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
            ;
            When(x => !x.Principal.IsInRole(RoleName.AuthorizationAgent), () =>
            {
                // do not let security admins revoke non-tenant roles
                RuleFor(x => x.RoleId)
                    .MustBeTenantRole(entities)
                        .WithMessage(MustBeTenantRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.RoleId)
                ;

                // do not let security admins revoke from users outside of their tenancy
                RuleFor(x => x.UserId)
                    .MustBeTenantUser(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantUser<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserId)
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
