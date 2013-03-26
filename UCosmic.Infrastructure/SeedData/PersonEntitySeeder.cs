using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Files;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class PersonEntitySeeder : BasePersonEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateMyPhotoId> _updatePhotoId;

        public PersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IHandleCommands<UpdateMyPhotoId> updatePhotoId
            , ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createPerson, createAffiliation, unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _updatePhotoId = updatePhotoId;
        }

        public override void Seed()
        {
            var suny = _queryProcessor.Execute(new EstablishmentByUrl("www.suny.edu"));
            var uc = _queryProcessor.Execute(new EstablishmentByUrl("www.uc.edu"));
            var lehigh = _queryProcessor.Execute(new EstablishmentByUrl("www.lehigh.edu"));
            var usil = _queryProcessor.Execute(new EstablishmentByUrl("www.usil.edu.pe"));
            var collegeBoard = _queryProcessor.Execute(new EstablishmentByUrl("www.collegeboard.org"));
            var terraDotta = _queryProcessor.Execute(new EstablishmentByUrl("www.terradotta.com"));

            Seed(suny.RevisionId, new CreatePerson
            {
                FirstName = "Mitch",
                LastName = "Leventhal",
                UserName = "Mitch.Leventhal@suny.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Mitch.Leventhal@suny.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            Seed(suny.RevisionId, new CreatePerson
            {
                FirstName = "Sally",
                LastName = "Crimmins Villela",
                UserName = "Sally.Crimmins@suny.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Sally.Crimmins@suny.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Female
            });

            Seed(uc.RevisionId, new CreatePerson
            {
                FirstName = "Ron",
                LastName = "Cushing",
                UserName = "Ronald.Cushing@uc.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Ronald.Cushing@uc.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "Ronald.Cushing@ucmail.uc.edu",
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "cushinrb@uc.edu",
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "cushinrb@ucmail.uc.edu",
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            Seed(uc.RevisionId, new CreatePerson
            {
                FirstName = "Mary",
                LastName = "Watkins",
                UserName = "Mary.Watkins@uc.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Mary.Watkins@uc.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "Mary.Watkins@ucmail.uc.edu",
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "watkinml@uc.edu",
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "watkinml@ucmail.uc.edu",
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Female
            });

            Seed(lehigh.RevisionId, new CreatePerson
            {
                FirstName = "Debra",
                LastName = "Nyby",
                UserName = "Debra.Nyby@lehigh.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Debra.Nyby@lehigh.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "dhn0@lehigh.edu",
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Female
            });

            Seed(lehigh.RevisionId, new CreatePerson
            {
                FirstName = "Gary",
                LastName = "Lutz",
                UserName = "Gary.Lutz@lehigh.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Gary.Lutz@lehigh.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "jgl3@lehigh.edu",
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            Seed(lehigh.RevisionId, new CreatePerson
            {
                FirstName = "Mohamed",
                LastName = "El-Aasser",
                UserName = "mohamed.el-aasser@lehigh.edu",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "mohamed.el-aasser@lehigh.edu",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                    new CreatePerson.EmailAddress
                    {
                        Value = "mse0@lehigh.edu",
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            Seed(usil.RevisionId, new CreatePerson
            {
                FirstName = "Dora",
                LastName = "Ballen Uriarte",
                UserName = "DBallen@usil.edu.pe",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "DBallen@usil.edu.pe",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Female
            });

            Seed(collegeBoard.RevisionId, new CreatePerson
            {
                FirstName = "Clay",
                LastName = "Hensley",
                UserName = "chensley@collegeboard.org",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "chensley@collegeboard.org",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            Seed(terraDotta.RevisionId, new CreatePerson
            {
                FirstName = "Brandon",
                LastName = "Lee",
                UserName = "Brandon@terradotta.com",
                UserIsRegistered = true,
                EmailAddresses = new[]
                {
                    new CreatePerson.EmailAddress
                    {
                        Value = "Brandon@terradotta.com",
                        IsDefault = true,
                        IsConfirmed = true,
                    },
                },
                Gender = PersonGender.Male
            });

            /* USF People */
            {
                var usf = _queryProcessor.Execute(new EstablishmentByUrl("www.usf.edu"));
                if (usf == null) throw new Exception("USF Establishment not found.");

                var person = Seed(usf.RevisionId, new CreatePerson
                {
                    FirstName = "Margaret",
                    LastName = "Kusenbach",
                    UserName = "mkusenba@usf.edu",
                    Gender = PersonGender.Female,
                    UserIsRegistered = true,
                    EmailAddresses = new[]
                        {
                            new CreatePerson.EmailAddress
                            {
                                Value = "mkusenba@usf.edu",
                                IsDefault = true,
                                IsConfirmed = true,
                            },
                        },
                });
                var photo = _entities.Get<LoadableFile>().Single(x => x.Filename == "mkusenba-photo.jpg");
                _updatePhotoId.Handle(new UpdateMyPhotoId(new GenericPrincipal(new GenericIdentity(person.User.Name), null), photo.Id));

                /* Affiliations set below. */

                person = Seed(usf.RevisionId, new CreatePerson
                {
                    FirstName = "William",
                    LastName = "Hogarth",
                    UserName = "billhogarth@usfsp.edu",
                    Gender = PersonGender.Male,
                    UserIsRegistered = true,
                    EmailAddresses = new[]
                        {
                            new CreatePerson.EmailAddress
                                {
                                    Value = "billhogarth@usfsp.edu",
                                    IsDefault = true,
                                    IsConfirmed = true,
                                },
                        },
                });
                photo = _entities.Get<LoadableFile>().Single(x => x.Filename == "billhogarth-photo.jpg");
                _updatePhotoId.Handle(new UpdateMyPhotoId(new GenericPrincipal(new GenericIdentity(person.User.Name), null), photo.Id));
                /* Affiliations set below. */
            } /* USF People */

        }
    }

    public abstract class BasePersonEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreatePerson> _createPerson;
        private readonly IHandleCommands<CreateAffiliation> _createAffiliation;
        private readonly IUnitOfWork _unitOfWork;

        protected BasePersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createPerson = createPerson;
            _createAffiliation = createAffiliation;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected Person Seed(int? establishmentId, CreatePerson command)
        {
            // make sure entity does not already exist
            var person = _queryProcessor.Execute(new PersonByEmail(command.EmailAddresses.First().Value));
            if (person != null) return person;

            if (string.IsNullOrWhiteSpace(command.DisplayName))
            {
                command.DisplayName = string.Format("{0} {1}", command.FirstName, command.LastName);
            }

            _createPerson.Handle(command);
            _unitOfWork.SaveChanges();
            person = command.CreatedPerson;

            if (establishmentId.HasValue)
            {
                _createAffiliation.Handle(new CreateAffiliation
                {
                    EstablishmentId = establishmentId.Value,
                    PersonId = person.RevisionId,
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });
                _unitOfWork.SaveChanges();
            }
            else
            {
                throw new NotSupportedException("Why is the person not affiliated with an employer?");
            }

            return person;
        }
    }
    
    public class AffiliationEntitySeeder : BaseAffiliationEntitySeeder
    {
        private readonly ICommandEntities _entities;

        public AffiliationEntitySeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createAffiliation, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            /* USF Affiliations */
            {
                /* ------------------------------------------------------------------------ */
                var person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("Could not find Douglas Corarito by name (did name change?).");

                var establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "University of South Florida");
                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });
                
                /* ------------------------------------------------------------------------ */
                person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "Margaret" && x.LastName == "Kusenbach");
                if (person == null) throw new Exception("Could not find Margaret Kusenbach by name (did name change?).");

                establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "USF College of Arts & Sciences Department of Sociology");
                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });

                /* ------------------------------------------------------------------------ */
                person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "William" && x.LastName == "Hogarth");
                if (person == null) throw new Exception("Could not find William Hogarth by name (did name change?).");

                establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "USF St. Petersburg Campus");

                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });
            }
        }
    }

    public abstract class BaseAffiliationEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateAffiliation> _createAffiliation;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseAffiliationEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IUnitOfWork unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _createAffiliation = createAffiliation;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected Affiliation Seed(CreateAffiliation command)
        {
            // make sure entity does not already exist
            Affiliation affiliation = _queryProcessor.Execute(
                new AffiliationByPrimaryKey(command.PersonId, command.EstablishmentId));

            if (affiliation != null) return affiliation;

            _createAffiliation.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedAffiliation;
        }

    }
}
