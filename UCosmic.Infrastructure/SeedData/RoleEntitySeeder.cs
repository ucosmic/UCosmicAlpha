using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.SeedData
{
    public class RoleEntitySeeder : BaseRoleSeeder, ISeedData
    {
        public RoleEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateRole> createRole
            , IHandleCommands<UpdateRole> updateRole
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createRole, updateRole, unitOfWork)
        {
        }

        public void Seed()
        {
            Seed(RoleName.SecurityAdministrator,
                "Security Administrators can grant and revoke access privileges to and from users within their organization."
            );
            Seed(RoleName.AuthenticationAgent,
                "Authentication Agents can sign on as any user, regardless of organization."
            );
            Seed(RoleName.AuthorizationAgent,
                "Authorization Agents can grant and revoke access privileges to any user, regardless of organization."
            );
            Seed(RoleName.AgreementManager,
                "Institutional Agreement Managers can add, edit, and otherwise manage institutional agreements for their institutions. " +
                "Additionally, they are allowed to view fields marked with 'private' access."
            );
            Seed(RoleName.AgreementSupervisor,
                "Institutional Agreement Supervisors have all of the same privileges ass Institutional Agreement Managers, " +
                "and can also edit the settings for the Institutional Agreement Module."
            );
            Seed(RoleName.EstablishmentLocationAgent,
                "Establishment Location Agents can modify location information for any organization."
            );
            Seed(RoleName.EstablishmentAdministrator,
                "Establishment Administrators can add, edit, and otherwise manage global establishment data."
            );
            Seed(RoleName.ElmahViewer,
                "Elmah Viewers can view the ELMAH error logs."
            );
            Seed(RoleName.EmployeeProfileManager,
                "Employee Profile Managers can view private information about employees and sign on as those employees to manage their data."
            );
        }
    }

    public abstract class BaseRoleSeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateRole> _createRole;
        private readonly IHandleCommands<UpdateRole> _updateRole;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseRoleSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateRole> createRole
            , IHandleCommands<UpdateRole> updateRole
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createRole = createRole;
            _updateRole = updateRole;
            _unitOfWork = unitOfWork;
        }

        protected void Seed(string roleName, string roleDescription)
        {
            var identity = new GenericIdentity("ludwigd@uc.edu");
            var principal = new GenericPrincipal(identity, new[] { RoleName.AuthorizationAgent });
            var role = _queryProcessor.Execute(new RoleByName(principal, roleName));
            if (role == null)
            {
                _createRole.Handle(new CreateRole(roleName) { Description = roleDescription, });
            }
            else
            {
                _updateRole.Handle(new UpdateRole(principal)
                {
                    EntityId = role.EntityId,
                    Description = roleDescription,
                });
            }
            _unitOfWork.SaveChanges();
        }
    }
}
