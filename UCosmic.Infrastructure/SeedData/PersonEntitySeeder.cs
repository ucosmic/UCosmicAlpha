using System;
using System.IO;
using System.Linq;
using System.Security.Principal;
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
            , IQueryEntities entities
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateEmailAddress> createEmail
            , IHandleCommands<CreateUser> createUser
            , IHandleCommands<UpdateMyPhoto> updatePhoto
        )
            : base(queryProcessor, entities, createPerson, createEmail, createUser)
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
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("Mitch.Leventhal@suny.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Sally",
                LastName = "Crimmins Villela",
                Gender = PersonGender.Female
            },
            new[]
            {
                new CreateEmailAddress("Sally.Crimmins@suny.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Ron",
                LastName = "Cushing",
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("Ronald.Cushing@uc.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
                new CreateEmailAddress("Ronald.Cushing@ucmail.uc.edu", 0)
                {
                    IsConfirmed = true,
                },
                new CreateEmailAddress("cushinrb@uc.edu", 0)
                {
                    IsConfirmed = true,
                },
                new CreateEmailAddress("cushinrb@ucmail.uc.edu", 0)
                {
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Mary",
                LastName = "Watkins",
                Gender = PersonGender.Female
            },
            new[]
            {
                new CreateEmailAddress("Mary.Watkins@uc.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
                new CreateEmailAddress("Mary.Watkins@ucmail.uc.edu", 0)
                {
                    IsConfirmed = true,
                },
                new CreateEmailAddress("watkinml@uc.edu", 0)
                {
                    IsConfirmed = true,
                },
                new CreateEmailAddress("watkinml@ucmail.uc.edu", 0)
                {
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Debra",
                LastName = "Nyby",
                Gender = PersonGender.Female
            },
            new[]
            {
                new CreateEmailAddress("Debra.Nyby@lehigh.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
                new CreateEmailAddress("dhn0@lehigh.edu", 0)
                {
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Gary",
                LastName = "Lutz",
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("Gary.Lutz@lehigh.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
                new CreateEmailAddress("jgl3@lehigh.edu", 0)
                {
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Mohamed",
                LastName = "El-Aasser",
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("mohamed.el-aasser@lehigh.edu", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                },
                new CreateEmailAddress("mse0@lehigh.edu", 0)
                {
                    IsConfirmed = true,
                },
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Dora",
                LastName = "Ballen Uriarte",
                Gender = PersonGender.Female
            },
            new[]
            {
                new CreateEmailAddress("DBallen@usil.edu.pe", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                }
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Clay",
                LastName = "Hensley",
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("chensley@collegeboard.org", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                }
            },
            true);

            Seed(new CreatePerson
            {
                FirstName = "Brandon",
                LastName = "Lee",
                Gender = PersonGender.Male
            },
            new[]
            {
                new CreateEmailAddress("Brandon@terradotta.com", 0)
                {
                    IsDefault = true,
                    IsConfirmed = true,
                }
            },
            true);

            /* USF People */
            {
                var usf = _queryProcessor.Execute(new EstablishmentByUrl("www.usf.edu"));
                if (usf == null) throw new Exception("USF Establishment not found.");

                var person = Seed(new CreatePerson
                {
                    FirstName = "Margaret",
                    LastName = "Kusenbach",
                    Gender = PersonGender.Female,
                },
                new[]
                {
                    new CreateEmailAddress("mkusenba@usf.edu", 0)
                    {
                        IsDefault = true,
                        IsConfirmed = true,
                    }
                },
                true);
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
                },
                new[]
                {
                    new CreateEmailAddress("billhogarth@usfsp.edu", 0)
                    {
                        IsDefault = true,
                        IsConfirmed = true,
                    }, 
                },
                true);
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
        private readonly IQueryEntities _entities;
        private readonly IHandleCommands<CreatePerson> _createPerson;
        private readonly IHandleCommands<CreateEmailAddress> _createEmail;
        private readonly IHandleCommands<CreateUser> _createUser;

        protected BasePersonEntitySeeder(IProcessQueries queryProcessor
            , IQueryEntities entities
            , IHandleCommands<CreatePerson> createPerson
            , IHandleCommands<CreateEmailAddress> createEmail
            , IHandleCommands<CreateUser> createUser
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _createPerson = createPerson;
            _createEmail = createEmail;
            _createUser = createUser;
        }

        public abstract void Seed();

        protected Person Seed(CreatePerson createPersonCommand, CreateEmailAddress[] createEmailCommands, bool? isRegisteredUser = null)
        {
            // make sure entity does not already exist
            //var person = _queryProcessor.Execute(new PersonByEmail(createPersonCommand.EmailAddresses.First().Value));
            var person = createEmailCommands != null && createEmailCommands.Any()
                ? _queryProcessor.Execute(new PersonByEmail(createEmailCommands.First().Value))
                : _entities.Query<Person>().FirstOrDefault(x => x.DisplayName == createPersonCommand.DisplayName 
                    || (x.FirstName == createPersonCommand.FirstName && x.LastName == createPersonCommand.LastName));
            if (person != null) return person;

            _createPerson.Handle(createPersonCommand);
            person = _queryProcessor.Execute(new PersonById(createPersonCommand.CreatedPersonId));

            if (createEmailCommands != null)
                foreach (var createEmailCommand in createEmailCommands.Select(x =>
                    new CreateEmailAddress(x.Value, person.RevisionId)
                    {
                        IsDefault = x.IsDefault,
                        IsConfirmed = x.IsConfirmed,
                    }))
                    _createEmail.Handle(createEmailCommand);

            if (isRegisteredUser.HasValue && createEmailCommands != null && createEmailCommands.Any())
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
}
