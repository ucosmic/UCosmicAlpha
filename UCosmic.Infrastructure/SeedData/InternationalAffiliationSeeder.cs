using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain;
using UCosmic.Domain.InternationalAffiliations;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;


namespace UCosmic.SeedData
{
    public class InternationalAffiliationEntitySeeder : ISeedData
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateInternationalAffiliation> _createAffiliation;
        private readonly IHandleCommands<CreateInternationalAffiliationLocation> _createAffiliationLocation;
        private readonly IUnitOfWork _unitOfWork;

        public InternationalAffiliationEntitySeeder(  ICommandEntities entities
                                    , IHandleCommands<CreateInternationalAffiliation> createAffiliation
                                    , IHandleCommands<CreateInternationalAffiliationLocation> createAffiliationLocation
                                    , IUnitOfWork unitOfWork
        )
        {
            _createAffiliation = createAffiliation;
            _createAffiliationLocation = createAffiliationLocation;
            _unitOfWork = unitOfWork;
            _entities = entities;
        }

        public void Seed()
        {
            /* ----- USF People Affiliations ----- */

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
                        RoleName.AgreementManager,
                        RoleName.AgreementSupervisor,
                        RoleName.EmployeeProfileManager,
                    };
                GenericIdentity identity = new GenericIdentity(user.Name);
                GenericPrincipal principal = new GenericPrincipal(identity, developerRoles);

                CreateInternationalAffiliation createInternationalAffiliationCommand;
                CreateInternationalAffiliationLocation createInternationalAffiliationLocationCommand;
                Place place;
                string placeName;

                // AFFILIATION 1
                Guid entityId = new Guid("2F37D74F-EEDF-4296-8FC4-664F529A93D7");
                bool expertiseExists = _entities.Get<InternationalAffiliation>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    createInternationalAffiliationCommand = new CreateInternationalAffiliation(principal)
                    {
                        EntityId = entityId,
                        From = new DateTime(2010,1,1),
                        To = new DateTime(2012,1,1),
                        OnGoing = false,
                        Institution = "Mzuzu University",
                        Position = "Director"
                    };

                    _createAffiliation.Handle(createInternationalAffiliationCommand);

                    placeName = "Africa";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createInternationalAffiliationLocationCommand = new CreateInternationalAffiliationLocation(principal, createInternationalAffiliationCommand.CreatedInternationalAffiliation.RevisionId, place.RevisionId);
                    _createAffiliationLocation.Handle(createInternationalAffiliationLocationCommand);

                    placeName = "Malawi";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createInternationalAffiliationLocationCommand = new CreateInternationalAffiliationLocation(principal, createInternationalAffiliationCommand.CreatedInternationalAffiliation.RevisionId, place.RevisionId);
                    _createAffiliationLocation.Handle(createInternationalAffiliationLocationCommand);

                    _unitOfWork.SaveChanges();
                } // AFFILIATION 1

                // AFFILIATION 2
                entityId = new Guid("54AA5D09-8917-4599-BD91-FC7DDB565F3E");
                expertiseExists = _entities.Get<InternationalAffiliation>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    createInternationalAffiliationCommand = new CreateInternationalAffiliation(principal)
                    {
                        EntityId = entityId,
                        From = new DateTime(2012, 1, 1),
                        To = null,
                        OnGoing = true,
                        Institution = "Silpakorn University",
                        Position = "Associate Investigator"
                    };

                    _createAffiliation.Handle(createInternationalAffiliationCommand);

                    placeName = "Thailand";
                    place = _entities.Get<Place>().FirstOrDefault(x => x.OfficialName == placeName);
                    if (place == null)
                    {
                        string message = String.Format("{0} not found", placeName);
                        throw new Exception(message);
                    }
                    createInternationalAffiliationLocationCommand = new CreateInternationalAffiliationLocation(principal, createInternationalAffiliationCommand.CreatedInternationalAffiliation.RevisionId, place.RevisionId);
                    _createAffiliationLocation.Handle(createInternationalAffiliationLocationCommand);

                    _unitOfWork.SaveChanges();
                } // AFFILIATION 2

            } // Douglas Corarito
        }
    }

}