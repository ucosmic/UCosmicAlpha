using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.SeedData
{
    public class DegreeEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateDegree> _createDegree;
        private readonly IUnitOfWork _unitOfWork;

        public DegreeEntitySeeder(IProcessQueries queryProcessor
                                    , ICommandEntities entities
                                    , IHandleCommands<CreateDegree> createDegree
                                    , IUnitOfWork unitOfWork
        )
        {
            _createDegree = createDegree;
            _unitOfWork = unitOfWork;
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public void Seed()
        {
            /* ----- USF People Degrees ----- */

            { // Douglas Corarito
                Person person = _entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("USF person Douglas Corarito not found");

                User user = _entities.Get<User>().SingleOrDefault(x => x.Person.RevisionId == person.RevisionId);
                if (user == null) throw new Exception("USF person Douglas Corarito has no User.");

                string[] developerRoles = new string[]
                    {
                        RoleName.AuthorizationAgent,
                        RoleName.EstablishmentLocationAgent,
                        RoleName.EstablishmentAdministrator,
                        RoleName.ElmahViewer,
                        RoleName.InstitutionalAgreementManager,
                        RoleName.InstitutionalAgreementSupervisor,
                        RoleName.EmployeeProfileManager,
                    };
                GenericIdentity identity = new GenericIdentity(user.Name);
                GenericPrincipal principal = new GenericPrincipal(identity, developerRoles);

                CreateDegree createDegreeCommand;
                Establishment institution;
                string institutionName;

                // DEGREE 1
                Guid entityId = new Guid("89538B2C-D4E9-4ABD-940D-16A7E08741A1");
                bool degreeExists = _entities.Get<Degree>().Count(x => x.EntityId == entityId) > 0;
                if (!degreeExists)
                {
                    institutionName = "University of Florida";

                    institution = _entities.Get<Establishment>().FirstOrDefault(x => x.OfficialName == institutionName);
                    if (institution == null)
                    {
                        string message = String.Format("{0} not found", institutionName);
                        throw new Exception(message);
                    }

                    createDegreeCommand = new CreateDegree(principal, "Master of Science")
                    {
                        EntityId = entityId,
                        YearAwarded = 2005,
                        InstitutionId = institution.RevisionId
                    };

                    _createDegree.Handle(createDegreeCommand);
                    _unitOfWork.SaveChanges();
                } // DEGREE 1

                // DEGREE2
                entityId = new Guid("38B78A49-B376-4851-BFF3-B44FE27800DA");
                degreeExists = _entities.Get<Degree>().Count(x => x.EntityId == entityId) > 0;
                if (!degreeExists)
                {
                    institutionName = "University of Florida";

                    institution = _entities.Get<Establishment>().FirstOrDefault(x => x.OfficialName == institutionName);
                    if (institution == null)
                    {
                        string message = String.Format("{0} not found", institutionName);
                        throw new Exception(message);
                    }

                    createDegreeCommand = new CreateDegree(principal, "Bachelor of Arts")
                    {
                        EntityId = entityId,
                        YearAwarded = 1994,
                        InstitutionId = institution.RevisionId
                    };

                    _createDegree.Handle(createDegreeCommand);
                    _unitOfWork.SaveChanges();
                } // DEGREE 1

            } // Douglas Corarito
        }
    }

}