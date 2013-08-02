using System;
using System.IO;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class PersonEntitySeeder : BasePersonEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateMyPhoto> _updatePhoto;

        public PersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateUser> createUser
            , IHandleCommands<UpdateMyPhoto> updatePhoto
        )
            : base(queryProcessor, createPerson, createUser)
        {
            _queryProcessor = queryProcessor;
            _updatePhoto = updatePhoto;
        }

        public override void Seed()
        {
            Seed(new CreatePerson
            {
                FirstName = "Mitch",
                LastName = "Leventhal",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Sally",
                LastName = "Crimmins Villela",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Ron",
                LastName = "Cushing",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Mary",
                LastName = "Watkins",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Debra",
                LastName = "Nyby",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Gary",
                LastName = "Lutz",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Mohamed",
                LastName = "El-Aasser",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Dora",
                LastName = "Ballen Uriarte",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Clay",
                LastName = "Hensley",
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
            }, true);

            Seed(new CreatePerson
            {
                FirstName = "Brandon",
                LastName = "Lee",
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
            }, true);

            /* USF People */
            {
                var usf = _queryProcessor.Execute(new EstablishmentByUrl("www.usf.edu"));
                if (usf == null) throw new Exception("USF Establishment not found.");

                var person = Seed(new CreatePerson
                {
                    FirstName = "Margaret",
                    LastName = "Kusenbach",
                    Gender = PersonGender.Female,
                    EmailAddresses = new[]
                        {
                            new CreatePerson.EmailAddress
                            {
                                Value = "mkusenba@usf.edu",
                                IsDefault = true,
                                IsConfirmed = true,
                            },
                        },
                }, true);
                var fileName = "mkusenba-photo.jpg";
                var principal = new GenericPrincipal(new GenericIdentity(person.User.Name), null);
                using (var fileStream = File.OpenRead(string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                    @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\", fileName)))
                {
                    var content = fileStream.ReadFully();
                    _updatePhoto.Handle(new UpdateMyPhoto(principal)
                    {
                        Content = content,
                        MimeType = "image/jpg",
                        Name = fileName,
                    });
                }

                /* Affiliations set below. */

                person = Seed(new CreatePerson
                {
                    FirstName = "William",
                    LastName = "Hogarth",
                    Gender = PersonGender.Male,
                    EmailAddresses = new[]
                    {
                        new CreatePerson.EmailAddress
                        {
                            Value = "billhogarth@usfsp.edu",
                            IsDefault = true,
                            IsConfirmed = true,
                        },
                    },
                }, true);
                fileName = "billhogarth-photo.jpg";
                principal = new GenericPrincipal(new GenericIdentity(person.User.Name), null);
                using (var fileStream = File.OpenRead(string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                    @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\", fileName)))
                {
                    var content = fileStream.ReadFully();
                    _updatePhoto.Handle(new UpdateMyPhoto(principal)
                    {
                        Content = content,
                        MimeType = "image/jpg",
                        Name = fileName,
                    });
                }

                /* Affiliations set below. */
            } /* USF People */

        }
    }

    public abstract class BasePersonEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreatePerson> _createPerson;
        private readonly IHandleCommands<CreateUser> _createUser;

        protected BasePersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateUser> createUser
        )
        {
            _queryProcessor = queryProcessor;
            _createPerson = createPerson;
            _createUser = createUser;
        }

        public abstract void Seed();

        protected Person Seed(CreatePerson command, bool? isRegisteredUser = null)
        {
            // make sure entity does not already exist
            var person = _queryProcessor.Execute(new PersonByEmail(command.EmailAddresses.First().Value));
            if (person != null) return person;

            _createPerson.Handle(command);
            person = _queryProcessor.Execute(new PersonById(command.CreatedPersonId));

            if (isRegisteredUser.HasValue)
            {
                var principal = new GenericPrincipal(new GenericIdentity("ludwigd@uc.edu"), new[] { RoleName.AuthenticationAgent });

                var createUserCommand = new CreateUser(principal, person.Emails.Single(x => x.IsDefault).Value)
                {
                    IsRegistered = isRegisteredUser.Value,
                    PersonId = person.RevisionId,
                };
                _createUser.Handle(createUserCommand);
            }

            return person;
        }
    }

    public class AffiliationEntitySeeder : BaseAffiliationEntitySeeder
    {
        private readonly ICommandEntities _entities;
        private readonly bool _doNotSeed = true;

        public AffiliationEntitySeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IQueryEntities detachedEntities
            , IHandleCommands<CreateMyAffiliation> createAffiliation
        )
            : base(queryProcessor, detachedEntities, createAffiliation)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            if (_doNotSeed) return;
            /* TBD - When USF departments are imported somehow this seed data is getting duplicated. */

            /* USF Affiliations */
            {
                /* ------------------------------------------------------------------------ */
                var person = _entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("Could not find Douglas Corarito by name (did name change?).");

                //var updateMyProfile = new UpdateMyProfile(person.User)
                //{
                //    JobTitles = "USF Distinquished Professor"
                //};
                //_updateProfile.Handle(updateMyProfile);            

                var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName == "University of South Florida");
                if (establishment == null) throw new Exception("Establishment is null");

                var campus = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "USF Tampa");
                if (campus == null) throw new Exception("Campus is null");

                var college = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "College of Medicine" && e.Parent.RevisionId == campus.RevisionId);
                if (college == null) throw new Exception("College is null");

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                    CampusId = campus.RevisionId,
                    CollegeId = college.RevisionId,
                    DepartmentId = _entities.Get<Establishment>()
                        .Single(e => e.OfficialName == "Center for Aging/Neuroscience" && e.Parent.RevisionId == college.RevisionId).RevisionId,
                    FacultyRankId = _entities.Get<EmployeeModuleSettings>()
                        .Single(s => s.Establishment.RevisionId == establishment.RevisionId).FacultyRanks.Single(r => r.Rank == "Distinguished University Professor").Id
                });

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                    CampusId = campus.RevisionId,
                    CollegeId = college.RevisionId,
                    DepartmentId = _entities.Get<Establishment>()
                        .Single(e => e.OfficialName == "Department of Neurology" && e.Parent.RevisionId == college.RevisionId).RevisionId,
                    FacultyRankId = _entities.Get<EmployeeModuleSettings>()
                        .Single(s => s.Establishment.RevisionId == establishment.RevisionId).FacultyRanks.Single(r => r.Rank == "Distinguished University Professor").Id
                });

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                    CampusId = campus.RevisionId,
                    CollegeId = college.RevisionId,
                    DepartmentId = _entities.Get<Establishment>()
                        .Single(e => e.OfficialName == "Department of Psychology & Behavior" && e.Parent.RevisionId == college.RevisionId).RevisionId,
                    FacultyRankId = _entities.Get<EmployeeModuleSettings>()
                        .Single(s => s.Establishment.RevisionId == establishment.RevisionId).FacultyRanks.Single(r => r.Rank == "Distinguished University Professor").Id
                });

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                    CampusId = campus.RevisionId,
                    CollegeId = college.RevisionId,
                    DepartmentId = _entities.Get<Establishment>()
                        .Single(e => e.OfficialName == "Molecular Pharmacology & Physiology" && e.Parent.RevisionId == college.RevisionId).RevisionId,
                    FacultyRankId = _entities.Get<EmployeeModuleSettings>()
                        .Single(s => s.Establishment.RevisionId == establishment.RevisionId).FacultyRanks.Single(r => r.Rank == "Distinguished University Professor").Id
                });

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                    CampusId = campus.RevisionId,
                    CollegeId = college.RevisionId,
                    DepartmentId = _entities.Get<Establishment>()
                        .Single(e => e.OfficialName == "Pathology and Cell Biology" && e.Parent.RevisionId == college.RevisionId).RevisionId,
                    FacultyRankId = _entities.Get<EmployeeModuleSettings>()
                        .Single(s => s.Establishment.RevisionId == establishment.RevisionId).FacultyRanks.Single(r => r.Rank == "Professor").Id
                });

                /* ------------------------------------------------------------------------ */
                person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "Margaret" && x.LastName == "Kusenbach");
                if (person == null) throw new Exception("Could not find Margaret Kusenbach by name (did name change?).");

                establishment = _entities.Get<Establishment>()
                                         .FirstOrDefault(x => x.OfficialName == "Department of Criminology");
                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
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

                Seed(new CreateMyAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });
            }
        }
    }

    public abstract class BaseAffiliationEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly IHandleCommands<CreateMyAffiliation> _createAffiliation;

        protected BaseAffiliationEntitySeeder(IProcessQueries queryProcessor, IQueryEntities entities, IHandleCommands<CreateMyAffiliation> createAffiliation)
        {
            _queryProcessor = queryProcessor;
            _createAffiliation = createAffiliation;
            _entities = entities;
        }

        public abstract void Seed();

        protected Affiliation Seed(CreateMyAffiliation command)
        {
            // make sure entity does not already exist
            Affiliation affiliation = _queryProcessor.Execute(
                new AffiliationByDepartment(command.PersonId,
                                             command.EstablishmentId,
                                             command.CampusId,
                                             command.CollegeId,
                                             command.DepartmentId));

            /* This needs to be changed to prevent duplicate affiliations. */
            if (affiliation != null)
            {
                return affiliation;
            }

            _createAffiliation.Handle(command);
            return _entities.Query<Affiliation>().Single(x => x.RevisionId == command.CreatedAffiliationId);
        }
    }
}
