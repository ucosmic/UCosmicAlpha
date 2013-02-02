using System;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class PersonEntitySeeder : BasePersonEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;

        public PersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateAffiliation> createAffiliation
            , ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createPerson, createAffiliation, unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
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

                var usfEmployeeModuleSettings = _entities.Get<EmployeeModuleSettings>().SingleOrDefault(s => s.Establishment.OfficialName == "University of South Florida");
                if (usfEmployeeModuleSettings == null) throw new Exception("USF EmployeeModuleSettings not found.");

                var associateProfessorRank = usfEmployeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Associate Professor");
                if (associateProfessorRank == null) throw new Exception("USF Associate Professor Rank not found.");

                Seed(usf.RevisionId, new CreatePerson
                {
                    FirstName = "Margaret",
                    LastName = "Kusenbach",
                    UserName = "mkusenba@usf.edu",
                    Gender = PersonGender.Female,
                    FacultyRank = associateProfessorRank,
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
                    AdministrativeAppointments = "Director of Sociology Graduate Program",
                    Picture = PeopleImages.BlueGradient128X128Jpeg,
                }); /* Affiliations set below. */

                Seed(usf.RevisionId, new CreatePerson
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
                    Picture = PeopleImages.BlueGradient128X128Jpeg,
                }); /* Affiliations set below. */
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
                if (person == null) throw new Exception("Person is null");

                var establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "University of South Florida");
                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    JobTitles = "Software Developer",
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });
                
                /* ------------------------------------------------------------------------ */
                person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "Margaret" && x.LastName == "Kusenbach");
                if (person == null) throw new Exception("Person is null");

                establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "USF College of Arts & Sciences Department of Sociology");
                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    JobTitles = "Associate Professor",
                    IsPrimary = true,
                    IsClaimingEmployee = true,
                    IsClaimingStudent = false,
                });

                /* ------------------------------------------------------------------------ */
                person = _entities.Get<Person>()
                    .SingleOrDefault(x => x.FirstName == "William" && x.LastName == "Hogarth");
                if (person == null) throw new Exception("Person is null");

                establishment = _entities.Get<Establishment>()
                    .SingleOrDefault(x => x.OfficialName == "USF St. Petersburg Campus");

                if (establishment == null) throw new Exception("Establishment is null");

                Seed(new CreateAffiliation
                {
                    PersonId = person.RevisionId,
                    EstablishmentId = establishment.RevisionId,
                    JobTitles = "Regional Chancellor",
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

    internal static class PeopleImages
    {
        // Block 1:
        // Offset: 0x00000000 (0)
        // Size: 0x000009e2 (2,530) bytes
        internal static Byte [] BlueGradient128X128Jpeg = new Byte []
        {
	        255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1, 0, 72, 
	        0, 72, 0, 0, 255, 225, 0, 104, 69, 120, 105, 102, 0, 0, 77, 77, 
	        0, 42, 0, 0, 0, 8, 0, 4, 1, 26, 0, 5, 0, 0, 0, 1, 
	        0, 0, 0, 62, 1, 27, 0, 5, 0, 0, 0, 1, 0, 0, 0, 70, 
	        1, 40, 0, 3, 0, 0, 0, 1, 0, 2, 0, 0, 1, 49, 0, 2, 
	        0, 0, 0, 18, 0, 0, 0, 78, 0, 0, 0, 0, 0, 0, 0, 72, 
	        0, 0, 0, 1, 0, 0, 0, 72, 0, 0, 0, 1, 80, 97, 105, 110, 
	        116, 46, 78, 69, 84, 32, 118, 51, 46, 53, 46, 49, 48, 0, 255, 219, 
	        0, 67, 0, 2, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 
	        2, 3, 5, 3, 3, 3, 3, 3, 6, 4, 4, 3, 5, 7, 6, 7, 
	        7, 7, 6, 7, 7, 8, 9, 11, 9, 8, 8, 10, 8, 7, 7, 10, 
	        13, 10, 10, 11, 12, 12, 12, 12, 7, 9, 14, 15, 13, 12, 14, 11, 
	        12, 12, 12, 255, 219, 0, 67, 1, 2, 2, 2, 3, 3, 3, 6, 3, 
	        3, 6, 12, 8, 7, 8, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 
	        12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 
	        12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 
	        12, 12, 12, 12, 12, 12, 12, 12, 255, 192, 0, 17, 8, 0, 128, 0, 
	        128, 3, 1, 34, 0, 2, 17, 1, 3, 17, 1, 255, 196, 0, 31, 0, 
	        0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 
	        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 255, 196, 0, 181, 
	        16, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 
	        125, 1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 
	        7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 
	        240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 
	        40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 
	        73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 
	        105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 
	        137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 
	        167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 
	        197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 
	        226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 
	        248, 249, 250, 255, 196, 0, 31, 1, 0, 3, 1, 1, 1, 1, 1, 1, 
	        1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 
	        8, 9, 10, 11, 255, 196, 0, 181, 17, 0, 2, 1, 2, 4, 4, 3, 
	        4, 7, 5, 4, 4, 0, 1, 2, 119, 0, 1, 2, 3, 17, 4, 5, 
	        33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 
	        145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 
	        52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 
	        56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 
	        88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 
	        120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 
	        150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 
	        180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 
	        210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 
	        233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250, 255, 218, 0, 12, 3, 
	        1, 0, 2, 17, 3, 17, 0, 63, 0, 253, 98, 138, 108, 253, 106, 220, 
	        19, 251, 214, 52, 55, 53, 114, 27, 128, 221, 235, 245, 137, 211, 60, 243, 
	        106, 222, 124, 213, 235, 105, 235, 14, 222, 227, 7, 173, 95, 182, 184, 206, 
	        43, 130, 173, 34, 211, 55, 173, 39, 236, 107, 78, 210, 110, 158, 213, 207, 
	        218, 207, 156, 86, 173, 149, 198, 113, 94, 101, 106, 101, 166, 116, 54, 82, 
	        230, 181, 172, 94, 185, 251, 9, 185, 21, 181, 97, 39, 34, 188, 92, 68, 
	        44, 106, 141, 235, 67, 144, 126, 149, 90, 248, 240, 126, 181, 61, 137, 220, 
	        63, 10, 175, 168, 28, 103, 235, 94, 100, 62, 59, 26, 61, 140, 123, 215, 
	        228, 214, 69, 236, 157, 107, 74, 253, 240, 13, 98, 95, 203, 140, 215, 179, 
	        134, 141, 204, 164, 82, 188, 155, 25, 172, 171, 169, 177, 154, 181, 125, 63, 
	        38, 178, 110, 238, 49, 158, 107, 218, 163, 76, 201, 178, 59, 153, 241, 89, 
	        215, 51, 230, 159, 117, 113, 215, 154, 207, 185, 185, 197, 122, 180, 169, 153, 
	        182, 99, 197, 63, 161, 171, 80, 221, 96, 245, 197, 98, 197, 119, 239, 86, 
	        97, 187, 227, 154, 246, 39, 68, 205, 51, 122, 11, 188, 213, 235, 107, 172, 
	        30, 181, 207, 67, 117, 142, 249, 171, 214, 183, 190, 245, 197, 86, 137, 105, 
	        157, 45, 165, 214, 113, 90, 182, 87, 92, 142, 107, 150, 181, 188, 198, 43, 
	        90, 198, 243, 56, 230, 188, 170, 244, 75, 76, 235, 44, 46, 51, 138, 222, 
	        211, 166, 206, 43, 144, 211, 111, 58, 115, 93, 30, 149, 113, 187, 21, 224, 
	        226, 169, 26, 197, 157, 110, 152, 219, 128, 168, 117, 67, 128, 125, 243, 75, 
	        163, 201, 184, 45, 71, 172, 182, 20, 215, 132, 151, 239, 13, 186, 24, 26, 
	        156, 184, 207, 53, 129, 168, 220, 109, 205, 106, 234, 243, 237, 39, 181, 115, 
	        90, 165, 214, 9, 231, 165, 125, 14, 18, 157, 204, 100, 202, 151, 215, 56, 
	        205, 100, 94, 93, 117, 230, 164, 212, 47, 112, 79, 53, 143, 121, 121, 140, 
	        243, 95, 67, 135, 160, 98, 216, 183, 55, 64, 103, 154, 207, 184, 186, 201, 
	        53, 29, 205, 222, 115, 205, 81, 184, 188, 235, 94, 173, 42, 38, 109, 152, 
	        241, 221, 15, 92, 84, 241, 93, 145, 222, 177, 18, 243, 29, 234, 104, 239, 
	        113, 222, 189, 185, 81, 50, 82, 55, 224, 190, 193, 235, 87, 45, 239, 129, 
	        61, 107, 155, 138, 255, 0, 222, 172, 195, 127, 142, 245, 203, 83, 14, 82, 
	        103, 87, 107, 127, 183, 28, 214, 173, 142, 161, 200, 230, 184, 203, 109, 79, 
	        4, 100, 214, 149, 158, 168, 6, 57, 175, 58, 182, 22, 232, 181, 35, 190, 
	        211, 53, 1, 145, 205, 116, 250, 45, 246, 226, 57, 175, 54, 211, 53, 113, 
	        145, 205, 117, 90, 22, 174, 11, 47, 53, 243, 216, 220, 35, 177, 180, 100, 
	        122, 142, 129, 54, 242, 57, 165, 215, 219, 102, 107, 55, 194, 119, 162, 82, 
	        188, 213, 175, 22, 220, 8, 183, 87, 201, 58, 118, 175, 202, 116, 167, 238, 
	        156, 150, 185, 121, 180, 181, 114, 154, 174, 160, 1, 60, 214, 135, 137, 53, 
	        80, 172, 220, 244, 174, 55, 87, 214, 62, 99, 205, 125, 126, 3, 10, 218, 
	        71, 44, 228, 46, 161, 168, 96, 158, 107, 34, 242, 255, 0, 4, 243, 85, 
	        111, 181, 97, 147, 205, 101, 92, 234, 121, 207, 53, 244, 212, 48, 166, 46, 
	        69, 219, 157, 67, 36, 243, 84, 103, 188, 245, 53, 74, 125, 71, 61, 234, 
	        164, 183, 249, 239, 94, 157, 60, 49, 14, 70, 122, 221, 251, 211, 214, 247, 
	        158, 163, 243, 172, 111, 181, 210, 253, 183, 29, 205, 123, 62, 192, 203, 152, 
	        220, 75, 234, 149, 53, 28, 119, 174, 120, 95, 255, 0, 181, 78, 26, 150, 
	        59, 212, 60, 53, 199, 204, 116, 241, 106, 184, 61, 106, 221, 190, 180, 20, 
	        245, 174, 56, 106, 196, 119, 167, 13, 115, 103, 241, 10, 202, 88, 27, 130, 
	        153, 232, 86, 62, 33, 218, 71, 205, 93, 46, 133, 226, 160, 174, 191, 61, 
	        120, 226, 248, 155, 97, 251, 213, 60, 62, 61, 22, 167, 59, 241, 143, 122, 
	        224, 175, 147, 58, 138, 201, 22, 170, 88, 250, 175, 225, 247, 137, 18, 226, 
	        100, 93, 195, 60, 86, 223, 196, 173, 93, 108, 80, 228, 129, 145, 154, 249, 
	        79, 65, 253, 164, 237, 188, 27, 58, 205, 113, 40, 242, 227, 57, 110, 123, 
	        85, 143, 25, 254, 222, 94, 27, 248, 181, 49, 109, 6, 121, 154, 24, 64, 
	        133, 252, 212, 216, 222, 98, 252, 173, 129, 233, 184, 28, 30, 227, 154, 249, 
	        106, 156, 23, 143, 158, 41, 85, 167, 77, 184, 117, 118, 209, 118, 185, 186, 
	        196, 193, 70, 205, 234, 119, 190, 39, 241, 90, 153, 24, 110, 174, 63, 82, 
	        241, 32, 114, 126, 106, 224, 174, 190, 39, 141, 65, 201, 243, 51, 159, 122, 
	        169, 39, 139, 124, 239, 226, 175, 174, 194, 228, 82, 164, 146, 104, 231, 149, 
	        91, 157, 133, 214, 185, 184, 245, 170, 51, 106, 217, 61, 107, 153, 58, 254, 
	        241, 247, 191, 90, 97, 214, 115, 220, 126, 117, 233, 195, 1, 98, 57, 142, 
	        130, 77, 79, 61, 234, 23, 212, 114, 107, 17, 181, 77, 221, 233, 63, 180, 
	        115, 222, 182, 88, 91, 11, 152, 99, 94, 123, 211, 77, 246, 59, 214, 99, 
	        93, 123, 212, 79, 123, 142, 245, 233, 42, 4, 92, 213, 109, 67, 220, 212, 
	        109, 169, 99, 189, 100, 73, 127, 138, 175, 46, 163, 199, 90, 214, 56, 107, 
	        139, 152, 217, 125, 87, 111, 122, 175, 54, 183, 179, 248, 171, 14, 227, 83, 
	        199, 122, 207, 187, 213, 241, 156, 26, 233, 167, 130, 191, 66, 92, 205, 235, 
	        191, 18, 20, 7, 230, 199, 227, 88, 122, 199, 140, 154, 21, 56, 122, 196, 
	        212, 117, 162, 1, 231, 38, 185, 109, 127, 92, 59, 27, 230, 175, 103, 9, 
	        149, 169, 53, 116, 101, 42, 133, 111, 137, 62, 61, 150, 91, 57, 17, 100, 
	        56, 32, 247, 175, 57, 248, 95, 226, 185, 116, 173, 66, 96, 28, 128, 210, 
	        146, 121, 245, 53, 99, 198, 90, 145, 157, 31, 154, 228, 60, 57, 116, 96, 
	        212, 31, 183, 205, 95, 162, 101, 249, 117, 56, 225, 37, 78, 219, 156, 147, 
	        155, 230, 185, 244, 159, 135, 60, 116, 243, 70, 185, 126, 213, 212, 88, 248, 
	        164, 200, 7, 205, 250, 215, 136, 120, 103, 91, 42, 171, 243, 126, 181, 217, 
	        233, 58, 225, 56, 249, 177, 95, 31, 143, 202, 163, 25, 59, 35, 162, 21, 
	        15, 78, 131, 94, 220, 62, 246, 106, 204, 122, 190, 236, 115, 92, 53, 150, 
	        177, 187, 25, 56, 173, 59, 109, 80, 227, 173, 120, 21, 112, 54, 232, 106, 
	        166, 117, 169, 170, 110, 29, 106, 69, 212, 7, 173, 115, 80, 234, 123, 187, 
	        213, 152, 175, 129, 239, 92, 146, 194, 216, 174, 98, 236, 151, 149, 12, 151, 
	        103, 215, 21, 82, 75, 188, 102, 170, 205, 121, 142, 245, 180, 40, 138, 229, 
	        201, 175, 64, 239, 85, 46, 53, 15, 122, 169, 53, 217, 53, 74, 226, 244, 
	        40, 235, 93, 116, 232, 18, 228, 89, 186, 191, 192, 228, 214, 93, 238, 165, 
	        144, 112, 120, 168, 110, 175, 73, 207, 53, 147, 127, 125, 193, 230, 189, 42, 
	        24, 98, 27, 19, 83, 212, 184, 60, 215, 45, 173, 234, 27, 129, 230, 175, 
	        106, 119, 184, 7, 154, 230, 181, 123, 172, 228, 87, 208, 224, 176, 233, 51, 
	        25, 51, 159, 241, 29, 193, 144, 55, 61, 107, 156, 211, 100, 217, 124, 231, 
	        222, 182, 53, 185, 119, 19, 205, 96, 218, 62, 219, 210, 107, 236, 48, 176, 
	        181, 59, 28, 210, 220, 238, 180, 27, 252, 5, 230, 186, 237, 39, 82, 192, 
	        28, 215, 159, 104, 215, 24, 0, 102, 186, 125, 46, 243, 129, 205, 120, 120, 
	        234, 9, 179, 104, 51, 187, 211, 245, 46, 57, 53, 175, 105, 168, 144, 7, 
	        53, 198, 105, 247, 217, 199, 53, 177, 103, 125, 140, 115, 95, 53, 95, 12, 
	        141, 147, 58, 203, 125, 64, 48, 28, 213, 200, 175, 15, 174, 107, 154, 183, 
	        188, 207, 126, 106, 245, 189, 238, 59, 215, 149, 83, 14, 104, 153, 179, 45, 
	        201, 61, 42, 188, 215, 24, 234, 106, 41, 174, 113, 84, 231, 186, 205, 101, 
	        10, 64, 217, 45, 205, 231, 90, 161, 115, 117, 140, 228, 211, 103, 184, 198, 
	        121, 170, 23, 87, 88, 174, 234, 84, 73, 108, 47, 111, 58, 138, 201, 190, 
	        186, 198, 121, 169, 110, 238, 115, 158, 107, 42, 250, 231, 57, 175, 82, 133, 
	        34, 27, 42, 106, 23, 57, 207, 53, 129, 169, 207, 184, 158, 107, 74, 254, 
	        126, 13, 97, 234, 18, 252, 166, 189, 220, 45, 59, 25, 72, 198, 213, 31, 
	        113, 53, 137, 25, 197, 221, 107, 106, 45, 144, 107, 31, 56, 185, 175, 163, 
	        195, 175, 118, 198, 12, 232, 52, 185, 177, 138, 232, 116, 235, 140, 99, 154, 
	        229, 180, 249, 48, 5, 110, 216, 77, 242, 143, 106, 243, 177, 80, 46, 44, 
	        234, 44, 110, 184, 28, 214, 197, 149, 222, 71, 90, 230, 44, 110, 58, 86, 
	        181, 165, 206, 49, 205, 120, 24, 138, 70, 201, 157, 37, 173, 214, 49, 205, 
	        104, 91, 221, 231, 169, 174, 122, 214, 231, 32, 115, 87, 237, 238, 113, 244, 
	        175, 42, 173, 19, 68, 206, 134, 107, 140, 247, 170, 211, 77, 129, 77, 154, 
	        108, 10, 169, 60, 245, 197, 78, 153, 77, 133, 197, 197, 80, 184, 159, 57, 
	        167, 79, 62, 77, 81, 185, 159, 2, 187, 233, 211, 36, 138, 242, 227, 0, 
	        214, 93, 220, 221, 106, 197, 212, 217, 172, 219, 185, 107, 211, 163, 76, 205, 
	        178, 157, 244, 185, 205, 99, 223, 201, 218, 180, 46, 164, 201, 53, 147, 124, 
	        249, 205, 123, 20, 34, 102, 217, 151, 124, 217, 6, 178, 92, 226, 226, 181, 
	        47, 91, 32, 253, 43, 42, 95, 245, 213, 237, 81, 90, 25, 72, 212, 176, 
	        110, 5, 108, 216, 75, 140, 86, 21, 139, 227, 21, 173, 101, 38, 63, 10, 
	        229, 196, 68, 164, 111, 89, 205, 131, 90, 182, 147, 228, 10, 193, 181, 147, 
	        129, 90, 86, 147, 112, 43, 198, 173, 3, 84, 205, 219, 91, 140, 98, 180, 
	        109, 231, 205, 97, 91, 205, 87, 237, 167, 233, 94, 93, 90, 101, 166, 127, 
	        255, 217
        };
        // End of Block 1
    }
}
