using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;
using UCosmic.Domain.LanguageExpertises;
using UCosmic.Domain.Languages;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class LanguageExpertiseEntitySeeder : ISeedData
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateLanguageExpertise> _createLanguageExpertise;
        private readonly IUnitOfWork _unitOfWork;

        public LanguageExpertiseEntitySeeder(  ICommandEntities entities
                                    , IHandleCommands<CreateLanguageExpertise> createLanguageExpertise
                                    , IUnitOfWork unitOfWork
        )
        {
            _createLanguageExpertise = createLanguageExpertise;
            _unitOfWork = unitOfWork;
            _entities = entities;
        }

        public void Seed()
        {
            /* ----- USF People LanguageExpertises ----- */

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

                CreateLanguageExpertise createLanguageExpertiseCommand;
                LanguageName languageName;

                // LANGUAGE EXPERTISE 1
                Guid entityId = new Guid("53ECE165-A1BC-4A20-9982-C0FF5E752085");
                bool expertiseExists = _entities.Get<LanguageExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    languageName = _entities.Get<LanguageName>().FirstOrDefault(x => x.Text == "Spanish");
                    if (languageName == null) { throw new Exception("Language not found.");}

                    createLanguageExpertiseCommand = new CreateLanguageExpertise(
                        principal,
                        languageName.LanguageId,
                        (int) LanguageExpertise.Proficiency.GeneralProfessional,
                        (int) LanguageExpertise.Proficiency.FunctionallyNative,
                        (int) LanguageExpertise.Proficiency.LimitedWorking,
                        (int) LanguageExpertise.Proficiency.Elementary)
                    {
                        EntityId = entityId
                    };

                    _createLanguageExpertise.Handle(createLanguageExpertiseCommand);

                    _unitOfWork.SaveChanges();
                } // LANGUAGE EXPERTISE 1

                // LANGUAGE EXPERTISE 2
                entityId = new Guid("897269C7-5869-4077-BABB-FA463F140555");
                expertiseExists = _entities.Get<LanguageExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    languageName = _entities.Get<LanguageName>().FirstOrDefault(x => x.Text == "Chinese");
                    if (languageName == null) { throw new Exception("Language not found."); }

                    createLanguageExpertiseCommand = new CreateLanguageExpertise(
                        principal,
                        languageName.LanguageId,
                        (int) LanguageExpertise.Proficiency.Elementary,
                        (int) LanguageExpertise.Proficiency.LimitedWorking,
                        (int) LanguageExpertise.Proficiency.None,
                        (int) LanguageExpertise.Proficiency.None)
                    {
                        Dialect = "Mandarin",
                        EntityId = entityId
                    };

                    _createLanguageExpertise.Handle(createLanguageExpertiseCommand);

                    _unitOfWork.SaveChanges();
                } // LANGUAGE EXPERTISE 2

                // LANGUAGE EXPERTISE 3
                entityId = new Guid("2C017B93-AD6D-4547-9866-61807EE1C853");
                expertiseExists = _entities.Get<LanguageExpertise>().Count(x => x.EntityId == entityId) > 0;
                if (!expertiseExists)
                {
                    languageName = _entities.Get<LanguageName>().FirstOrDefault(x => x.Text == "German");
                    if (languageName == null) { throw new Exception("Language not found."); }

                    createLanguageExpertiseCommand = new CreateLanguageExpertise(
                        principal,
                        languageName.LanguageId,
                        (int) LanguageExpertise.Proficiency.FunctionallyNative,
                        (int) LanguageExpertise.Proficiency.FunctionallyNative,
                        (int) LanguageExpertise.Proficiency.GeneralProfessional,
                        (int) LanguageExpertise.Proficiency.GeneralProfessional)
                    {
                        Other = "Walser",
                        EntityId = entityId
                    };

                    _createLanguageExpertise.Handle(createLanguageExpertiseCommand);

                    _unitOfWork.SaveChanges();
                } // LANGUAGE EXPERTISE 3

            } // Douglas Corarito
        }
    }

}