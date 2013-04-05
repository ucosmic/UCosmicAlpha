using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class UserEntitySeeder : BasePersonEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<GrantRoleToUser> _grantRole;
        private readonly IUnitOfWork _unitOfWork;

        public UserEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IHandleCommands<GrantRoleToUser> grantRole
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createPerson, createAffiliation, unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _grantRole = grantRole;
            _unitOfWork = unitOfWork;
        }

        public override void Seed()
        {
            var developerRoles = new[]
            {
                RoleName.AuthorizationAgent,
                RoleName.EstablishmentLocationAgent,
                RoleName.EstablishmentAdministrator,
                RoleName.ElmahViewer,
                RoleName.InstitutionalAgreementManager,
                RoleName.InstitutionalAgreementSupervisor,
                RoleName.EmployeeProfileManager,
            };

            // seed developers
            Seed(new[]
                {
                    "ludwigd@uc.edu",
                    "Daniel.Ludwig@uc.edu",
                    "ludwigd@ucmail.uc.edu",
                    "Daniel.Ludwig@ucmail.uc.edu",
                },
                "Dan", "Ludwig", PersonGender.Male, "www.uc.edu", developerRoles);
            Seed("ganesh_c@uc.edu", "Ganesh", "Chitrothu", PersonGender.Male, "www.uc.edu", developerRoles);
            Seed("corarito@usf.edu", "Douglas", "Corarito", PersonGender.Male, "www.usf.edu", developerRoles);

            // seed example non-academic users
            Seed("test@terradotta.com", "Terradotta", "Test", PersonGender.NonDisclosed, "www.terradotta.com");

            var testEstablishments = new Dictionary<string, string>
            {
                { "www.uc.edu",           "@uc.edu"             },
                { "www.suny.edu",         "@suny.edu"           },
                { "www.stonybrook.edu",   "@stonybrook.edu"     },
                { "www.umn.edu",          "@umn.edu"            },
                { "www.lehigh.edu",       "@lehigh.edu"         },
                { "www.usil.edu.pe",      "@usil.edu.pe"        },
                { "www.bjtu.edu.cn",      "@bjtu.edu.cn"        },
                { "www.napier.ac.uk",     "@napier.ac.uk"       },
                { "www.fue.edu.eg",       "@fue.edu.eg"         },
                { "www.griffith.edu.au",  "@griffith.edu.au"    },
                { "www.unsw.edu.au",      "@unsw.edu.au"        },
                { "www.usf.edu",          "@usf.edu"            },
                { "www.uwo.ca",           "@uwo.ca"             },
            };
            var managerRoles = new[] { RoleName.InstitutionalAgreementManager, RoleName.EmployeeProfileManager };
            var supervisorRoles = new[] { RoleName.InstitutionalAgreementSupervisor };
            var adminRoles = new[] { RoleName.SecurityAdministrator };

            foreach (var testEstablishment in testEstablishments)
            {
                Seed(string.Format("any1{0}", testEstablishment.Value)
                    , "Any"
                    , "One"
                    , PersonGender.NonDisclosed
                    , testEstablishment.Key);

                Seed(string.Format("manager1{0}", testEstablishment.Value)
                    , "Manager"
                    , "One"
                    , PersonGender.NonDisclosed
                    , testEstablishment.Key
                    , managerRoles);

                Seed(string.Format("supervisor1{0}", testEstablishment.Value)
                    , "Supervisor"
                    , "One"
                    , PersonGender.NonDisclosed
                    , testEstablishment.Key
                    , supervisorRoles);

                Seed(string.Format("admin1{0}", testEstablishment.Value)
                    , "Administrator"
                    , "One"
                    , PersonGender.NonDisclosed
                    , testEstablishment.Key
                    , adminRoles);
            }
        }

        protected void Seed(string[] emails
            , string firstName
            , string lastName
            , string gender
            , string establishmentUrl
            , string[] roles = null)
        {
            // make sure establishment exists
            var establishment = _queryProcessor.Execute(new EstablishmentByUrl(establishmentUrl));
            if (establishment == null)
                throw new InvalidOperationException(string.Format(
                    "There is no establishment for URL '{0}'.", establishmentUrl));

            var person = Seed(establishment.RevisionId, new CreatePerson
            {
                FirstName = firstName,
                LastName = lastName,
                UserName = emails.First(),
                UserIsRegistered = true,
                EmailAddresses = emails.Select(e =>
                    new CreatePerson.EmailAddress
                    {
                        Value = e,
                        IsConfirmed = (!e.Equals("Daniel.Ludwig@ucmail.uc.edu")),
                        IsDefault = e == emails.First(),
                    })
                    .ToArray(),
                Gender = gender,
            });

            var principal = new GenericPrincipal(new GenericIdentity("ludwigd@uc.edu"), new[] { RoleName.AuthorizationAgent, });
            if (roles != null && roles.Any())
            {
                foreach (var roleName in roles)
                {
                    if (person.User.Grants.Select(g => g.Role.Name).Contains(roleName))
                        continue;

                    var role = _queryProcessor.Execute(new RoleByName(principal, roleName));
                    _grantRole.Handle(new GrantRoleToUser(principal, role.RevisionId, person.User.RevisionId));
                }
            }

            _unitOfWork.SaveChanges();
        }

        protected void Seed(string userName
            , string firstName
            , string lastName
            , string gender
            , string establishmentUrl
            , string[] roles = null)
        {
            Seed(new[] { userName }, firstName, lastName, gender, establishmentUrl, roles);
        }
    }
}
