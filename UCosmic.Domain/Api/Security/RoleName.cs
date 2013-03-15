using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;

namespace UCosmic
{
    public static class RoleName
    {
        public const string RoleDelimiter = ",";
        public const string AuthenticationAgent = "Authentication Agent"; // impersonate regardless of tenant
        public const string AuthorizationAgent = "Authorization Agent"; // grant access regardless of tenant
        public const string SecurityAdministrator = "Security Administrator"; // grant access for own tenant
        public const string EmployeeProfileManager = "Employee Profile Manager"; // impersonate for own tenant
        public const string UserManagers = "Authentication Agent,Authorization Agent,Security Administrator,Employee Profile Manager";
        public const string UserImpersonators = "Authentication Agent,Employee Profile Manager";
        public const string UserGrantors = "Authorization Agent,Security Administrator";

        public const string InstitutionalAgreementSupervisor = "Institutional Agreement Supervisor";
        public const string InstitutionalAgreementManager = "Institutional Agreement Manager";
        public const string InstitutionalAgreementManagers = "Institutional Agreement Supervisor,Institutional Agreement Manager";

        public const string EstablishmentLocationAgent = "Establishment Location Agent";

        public const string ElmahViewer = "Elmah Viewer";
        public const string EstablishmentAdministrator = "Establishment Administrator";

        //public static bool IsInAnyRole(this IPrincipal principal, string commaSeparatedRoles)
        //{
        //    if (string.IsNullOrWhiteSpace(commaSeparatedRoles))
        //        throw new ArgumentException("Cannot be null or white space.", "commaSeparatedRoles");
        //    var splitRoles = commaSeparatedRoles.Split(new[] { RoleDelimiter }, StringSplitOptions.RemoveEmptyEntries);
        //    return splitRoles.Any(principal.IsInRole);
        //}

        public static bool IsInAnyRole(this IPrincipal principal, params string[] roles)
        {
            if (roles == null || !roles.Any()) return false;
            var rolesList = new List<string>();
            foreach (var role in roles)
                if (role.Contains(RoleDelimiter))
                    rolesList.AddRange(role.Explode(RoleDelimiter));
                else
                    rolesList.Add(role);
            roles = rolesList.Distinct().ToArray();
            return roles.Any(principal.IsInRole);
        }
    }
}
