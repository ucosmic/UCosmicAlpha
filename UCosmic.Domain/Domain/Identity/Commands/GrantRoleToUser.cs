using System;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Identity
{
    public class GrantRoleToUser
    {
        public GrantRoleToUser(Guid roleGuid, Guid userGuid)
        {
            if (roleGuid == Guid.Empty) throw new ArgumentException("Cannot be empty", "roleGuid");
            if (userGuid == Guid.Empty) throw new ArgumentException("Cannot be empty", "userGuid");
            RoleGuid = roleGuid;
            UserGuid = userGuid;
        }

        internal GrantRoleToUser(Role role, Guid userGuid)
        {
            if (role == null) throw new ArgumentNullException("role");
            if (userGuid == Guid.Empty) throw new ArgumentException("Cannot be empty", "userGuid");
            Role = role;
            UserGuid = userGuid;
        }

        public Guid RoleGuid { get; private set; }
        public Guid UserGuid { get; private set; }
        public bool IsNewlyGranted { get; internal set; }
        internal Role Role { get; set; }
    }

    public class HandleGrantRoleToUserCommand : IHandleCommands<GrantRoleToUser>
    {
        private readonly ICommandEntities _entities;

        public HandleGrantRoleToUserCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(GrantRoleToUser command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var role = command.Role ??
                _entities.Get<Role>()
                .EagerLoad(_entities, new Expression<Func<Role, object>>[]
                {
                    r => r.Grants,
                })
                .SingleOrDefault(x => x.EntityId == command.RoleGuid);
            if (role == null)
                throw new InvalidOperationException(string.Format("Role with id '{0}' does not exist.", command.RoleGuid));

            var grant = role.Grants.SingleOrDefault(x => x.User.EntityId == command.UserGuid);
            if (grant != null) return;

            var user = _entities.Get<User>().SingleOrDefault(x => x.EntityId == command.UserGuid);
            grant = new RoleGrant
            {
                Role = role,
                User = user,
            };
            _entities.Create(grant);
            command.IsNewlyGranted = true;
        }
    }
}
