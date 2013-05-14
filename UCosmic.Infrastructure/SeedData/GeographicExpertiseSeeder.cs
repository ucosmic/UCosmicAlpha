using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.GeographicExpertises;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.SeedData
{
    public class GeographicExpertiseEntitySeeder : ISeedData
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateGeographicExpertise> _createGeographicExpertise;
        private readonly IUnitOfWork _unitOfWork;

        public GeographicExpertiseEntitySeeder(  ICommandEntities entities
                                    , IHandleCommands<CreateGeographicExpertise> createGeographicExpertise
                                    , IUnitOfWork unitOfWork
        )
        {
            _createGeographicExpertise = createGeographicExpertise;
            _unitOfWork = unitOfWork;
            _entities = entities;
        }

        public void Seed()
        {
            /* ----- USF People GeographicExpertises ----- */

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

                CreateGeographicExpertise createGeographicExpertiseCommand;
                Place place;
                string placeName;

                // GEOGRAPHIC EXPERTISE 1
                Guid entityId = new Guid("82A4789E-7B60-489F-B0FF-79AA6BA24E19");
                bool expertiseExists = _entities.Get<GeographicExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    placeName = "Brazil";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }

                    createGeographicExpertiseCommand = new CreateGeographicExpertise(principal, place.RevisionId)
                    {
                        EntityId = entityId,
                        Description = "I have lived and work here for over 10 years mingling with the locals and eating their food."

                    };

                    _createGeographicExpertise.Handle(createGeographicExpertiseCommand);
                    _unitOfWork.SaveChanges();
                } // GEOGRAPHIC EXPERTISE 1

                // GEOGRAPHIC EXPERTISE 2
                entityId = new Guid("8E0CE863-B3D0-44AC-87A7-8F774731CCA9");
                expertiseExists = _entities.Get<GeographicExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    placeName = "Peru";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }

                    createGeographicExpertiseCommand = new CreateGeographicExpertise(principal, place.RevisionId)
                    {
                        EntityId = entityId,
                        Description = "While living in the mountains, I mingled with the locals and taught English."
                    };

                    _createGeographicExpertise.Handle(createGeographicExpertiseCommand);
                    _unitOfWork.SaveChanges();
                } // GEOGRAPHIC EXPERTISE 2

            } // Douglas Corarito
        }
    }

}