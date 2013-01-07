using System;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class PersonEntitySeeder : BasePersonEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public PersonEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createPerson, createAffiliation, unitOfWork)
        {
            _queryProcessor = queryProcessor;
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
            var person = _queryProcessor.Execute(new PersonByEmail
            {
                Email = command.EmailAddresses.First().Value,
            });
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
}
