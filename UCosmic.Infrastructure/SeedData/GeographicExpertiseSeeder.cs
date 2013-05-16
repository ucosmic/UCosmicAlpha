using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.GeographicExpertises;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.SeedData
{
    public class GeographicExpertiseEntitySeeder : ISeedData
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateGeographicExpertise> _createGeographicExpertise;
        private readonly IHandleCommands<CreateGeographicExpertiseLocation> _createGeographicExpertiseLocation;
        private readonly IUnitOfWork _unitOfWork;

        public GeographicExpertiseEntitySeeder(  ICommandEntities entities
                                    , IHandleCommands<CreateGeographicExpertise> createGeographicExpertise
                                    , IHandleCommands<CreateGeographicExpertiseLocation> createGeographicExpertiseLocation
                                    , IUnitOfWork unitOfWork
        )
        {
            _createGeographicExpertise = createGeographicExpertise;
            _createGeographicExpertiseLocation = createGeographicExpertiseLocation;
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
                CreateGeographicExpertiseLocation createGeographicExpertiseLocationCommand;
                Place place;
                string placeName;

                // GEOGRAPHIC EXPERTISE 1
                Guid entityId = new Guid("82A4789E-7B60-489F-B0FF-79AA6BA24E19");
                bool expertiseExists = _entities.Get<GeographicExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    createGeographicExpertiseCommand = new CreateGeographicExpertise(principal)
                    {
                        EntityId = entityId,
                        Description = "Justo altera ut eam, sit ei cibo porro homero, verear convenire constituto id duo. Ea natum ipsum liberavisse eum. Eu mei nisl ancillae, ei quando ridens volutpat eos. Sit cu eleifend deseruisse."

                    };

                    _createGeographicExpertise.Handle(createGeographicExpertiseCommand);

                    placeName = "Brazil";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createGeographicExpertiseLocationCommand = new CreateGeographicExpertiseLocation(principal, createGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId, place.RevisionId);
                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocationCommand);

                    placeName = "Argentina";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createGeographicExpertiseLocationCommand = new CreateGeographicExpertiseLocation(principal, createGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId, place.RevisionId);
                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocationCommand);

                    _unitOfWork.SaveChanges();
                } // GEOGRAPHIC EXPERTISE 1

                // GEOGRAPHIC EXPERTISE 2
                entityId = new Guid("8E0CE863-B3D0-44AC-87A7-8F774731CCA9");
                expertiseExists = _entities.Get<GeographicExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    createGeographicExpertiseCommand = new CreateGeographicExpertise(principal)
                    {
                        EntityId = entityId,
                        Description = "Vocent oblique comprehensam sit id, quo nisl corpora molestie ea. Prima liberavisse qui ne, invidunt elaboraret ullamcorper eos et, volumus qualisque hendrerit nam ut."
                    };

                    _createGeographicExpertise.Handle(createGeographicExpertiseCommand);

                    placeName = "Uruguay";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createGeographicExpertiseLocationCommand = new CreateGeographicExpertiseLocation(principal, createGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId, place.RevisionId);
                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocationCommand);

                    placeName = "Colombia";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createGeographicExpertiseLocationCommand = new CreateGeographicExpertiseLocation(principal, createGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId, place.RevisionId);
                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocationCommand);

                    placeName = "Peru";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createGeographicExpertiseLocationCommand = new CreateGeographicExpertiseLocation(principal, createGeographicExpertiseCommand.CreatedGeographicExpertise.RevisionId, place.RevisionId);
                    _createGeographicExpertiseLocation.Handle(createGeographicExpertiseLocationCommand);

                    _unitOfWork.SaveChanges();
                } // GEOGRAPHIC EXPERTISE 2

            } // Douglas Corarito
        }
    }

}