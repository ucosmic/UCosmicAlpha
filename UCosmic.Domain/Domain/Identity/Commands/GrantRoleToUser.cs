using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

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

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)

                // principal.identity.name cannot be null or empty
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)

                // principal.identity.name must match User.Name entity property
                .MustFindUserByPrincipal(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)

                // principal must be authorized to grant roles
                .MustBeInAnyRole(RoleName.RoleGrantors)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
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
                // do not let security admins grant non-tenant roles
                RuleFor(x => x.RoleId)
                    .MustBeTenantRole(entities)
                        .WithMessage(MustBeTenantRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.RoleId)
                ;

                // do not let security admins grant to users outside of their tenancy
                RuleFor(x => x.UserId)
                    .MustBeTenantUserId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantUserId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserId)
                ;
            });
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
                .Single(x => x.RevisionId == command.RoleId);

            var grant = role.Grants.SingleOrDefault(x => x.User.RevisionId == command.UserId);
            if (grant != null) return;

            var user = _entities.Get<User>().Single(x => x.RevisionId == command.UserId);
            grant = new RoleGrant
            {
                Role = role,
                User = user,
            };

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.UserId,
                    command.RoleId,
                }),
                NewState = grant.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Create(grant);
            _unitOfWork.SaveChanges();
        }
    }
}
