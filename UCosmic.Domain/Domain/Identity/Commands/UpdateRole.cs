using System;
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
        public int ChangeCount { get; internal set; }
    }

    public class HandleUpdateRoleCommand : IHandleCommands<UpdateRole>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateRoleCommand(ICommandEntities entities)
        {
            _entities = entities;
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

            if (command.ChangeCount < 1) return;

            entity.UpdatedByPrincipal = command.Principal.Identity.Name;
            entity.UpdatedOnUtc = DateTime.UtcNow;

            _entities.Update(entity);
        }
    }
}
