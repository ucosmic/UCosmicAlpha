using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using System.ServiceModel.Security;

namespace UCosmic.Domain.Identity
{
    public class UpdateRole
    {
        public UpdateRole(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public Guid EntityId { get; set; }
        public string Description { get; set; }
        public IEnumerable<Guid> RevokedUserEntityIds { get; set; }
        public IEnumerable<Guid> GrantedUserEntityIds { get; set; }
        public int ChangeCount { get; internal set; }
    }

    public class HandleUpdateRoleCommand : IHandleCommands<UpdateRole>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<RevokeRoleFromUser> _revokeHandler;
        private readonly IHandleCommands<GrantRoleToUser> _grantHandler;

        public HandleUpdateRoleCommand(ICommandEntities entities
            , IHandleCommands<RevokeRoleFromUser> revokeHandler
            , IHandleCommands<GrantRoleToUser> grantHandler
        )
        {
            _entities = entities;
            _revokeHandler = revokeHandler;
            _grantHandler = grantHandler;
        }

        public void Handle(UpdateRole command)
        {
            if (command == null) throw new ArgumentNullException("command");

            if (!command.Principal.IsInRole(RoleName.AuthorizationAgent))
                throw new SecurityAccessDeniedException(string.Format(
                    "User '{0}' does not have privileges to invoke this function.",
                        command.Principal.Identity.Name));

            var entity = _entities.Get<Role>()
                .EagerLoad(_entities, new Expression<Func<Role, object>>[]
                {
                    r => r.Grants.Select(g => g.User)
                })
                .SingleOrDefault(x => x.EntityId == command.EntityId);

            if (entity == null) throw new InvalidOperationException(string.Format(
                "Entity '{0}' could not be found.", command.EntityId));
            command.ChangeCount = 0;

            if (entity.Description != command.Description) ++command.ChangeCount;
            entity.Description = command.Description;

            if (command.RevokedUserEntityIds != null)
                foreach (var revokedUserEntityId in command.RevokedUserEntityIds)
                {
                    var revoke = new RevokeRoleFromUser(entity.EntityId, revokedUserEntityId);
                    _revokeHandler.Handle(revoke);
                    if (revoke.IsNewlyRevoked) ++command.ChangeCount;
                }

            if (command.GrantedUserEntityIds != null)
                foreach (var grantedUserEntityId in command.GrantedUserEntityIds)
                {
                    var grant = new GrantRoleToUser(entity, grantedUserEntityId);
                    _grantHandler.Handle(grant);
                    if (grant.IsNewlyGranted) ++command.ChangeCount;

                }

            if (command.ChangeCount < 1) return;

            entity.UpdatedByPrincipal = command.Principal.Identity.Name;
            entity.UpdatedOnUtc = DateTime.UtcNow;

            _entities.Update(entity);
        }
    }
}
