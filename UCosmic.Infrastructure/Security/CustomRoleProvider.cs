using System;
using System.Linq;
using System.Web.Security;
using UCosmic.Domain.Identity;
using UCosmic.EntityFramework;

namespace UCosmic.Security
{
    public class CustomRoleProvider : RoleProvider
    {
        private static UCosmicContext GetEntities()
        {
            // new up context to avoid ArgumentExceptions on Set<Role>().AsNoTracking()
            return new UCosmicContext();
        }

        public override string[] GetRolesForUser(string userName)
        {
            using (var entities = GetEntities())
            {
                return entities.Set<Role>()
                    .AsNoTracking()
                    .Where(x => x.Grants.Any(y => y.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase)))
                    .Select(x => x.Name)
                    .Distinct()
                    .ToArray()
                ;
            }
        }

        public override bool IsUserInRole(string username, string roleName)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override void CreateRole(string roleName)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override bool DeleteRole(string roleName, bool throwOnPopulatedRole)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override bool RoleExists(string roleName)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override void AddUsersToRoles(string[] usernames, string[] roleNames)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override void RemoveUsersFromRoles(string[] usernames, string[] roleNames)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override string[] GetUsersInRole(string roleName)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override string[] GetAllRoles()
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override string[] FindUsersInRole(string roleName, string usernameToMatch)
        {
            throw new NotSupportedException("Please use RoleProvider.GetRolesForUser instead.");
        }

        public override string ApplicationName
        {
            get { throw new NotSupportedException(); }
            set { throw new NotSupportedException(); }
        }
    }
}
