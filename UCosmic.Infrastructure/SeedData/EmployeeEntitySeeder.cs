using System;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;


namespace UCosmic.SeedData
{
    public class EmployeeModuleSettingsEntitySeeder : ISeedData
    {
        private readonly UcEmployeeModuleSettingsSeeder _ucEmployeeModuleSettingsSeeder;
        private readonly UsfEmployeeModuleSettingsSeeder _usfEmployeeModuleSettingsSeeder;

        public EmployeeModuleSettingsEntitySeeder(UcEmployeeModuleSettingsSeeder ucEmployeeModuleSettingsSeeder
            , UsfEmployeeModuleSettingsSeeder usfEmployeeModuleSettingsSeeder
        )
        {
            _ucEmployeeModuleSettingsSeeder = ucEmployeeModuleSettingsSeeder;
            _usfEmployeeModuleSettingsSeeder = usfEmployeeModuleSettingsSeeder;
        }

        public void Seed()
        {
            _ucEmployeeModuleSettingsSeeder.Seed();
            _usfEmployeeModuleSettingsSeeder.Seed();
        }
    }

    public class UcEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }

        public UcEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName == "University of Cincinnati");
            if (establishment == null) throw new Exception("Establishment is null");
            CreatedEmployeeModuleSettings = Seed(new CreateEmployeeModuleSettings
            {
                EmployeeFacultyRanks = new Collection<EmployeeFacultyRank>
                {
                    /* TODO: Need actual UC ranks here. */
                    new EmployeeFacultyRank {Rank = "Assistant Professor"},
                    new EmployeeFacultyRank {Rank = "Associate Professor"},
                    new EmployeeFacultyRank {Rank = "Professor"},
                    new EmployeeFacultyRank {Rank = "Distinquished Professor"},
                    new EmployeeFacultyRank {Rank = "Other"},
                },
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = null, //"My International",
                EstablishmentId = establishment.RevisionId,
                    /* TODO: Need actual UC activity types here. */
                EmployeeActivityTypes = new Collection<EmployeeActivityType>
                {
                    new EmployeeActivityType {Type = "Research or Creative Endeavor", Rank = 1},
                    new EmployeeActivityType {Type = "Teaching or Mentoring", Rank = 2},
                    new EmployeeActivityType {Type = "Award or Honor", Rank = 3},
                    new EmployeeActivityType {Type = "Conference Presentation or Proceeding", Rank = 4},
                    new EmployeeActivityType {Type = "Professional Development, Service or Consulting", Rank = 5}
                }
            });
        }
    }

    public class UsfEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }

        public UsfEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName == "University of South Florida");
            if (establishment == null) throw new Exception("Establishment is null");
            CreatedEmployeeModuleSettings = Seed(new CreateEmployeeModuleSettings
            {
                EmployeeFacultyRanks = new Collection<EmployeeFacultyRank>
                {
                    new EmployeeFacultyRank {Rank = "Assistant Professor"},
                    new EmployeeFacultyRank {Rank = "Associate Professor"},
                    new EmployeeFacultyRank {Rank = "Professor"},
                    new EmployeeFacultyRank {Rank = "Distinquished Professor"},
                    new EmployeeFacultyRank {Rank = "Other"},
                },
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = "My USF World Profile",
                EstablishmentId = establishment.RevisionId,
                EmployeeActivityTypes = new Collection<EmployeeActivityType>
                {
                    new EmployeeActivityType {Type = "Research or Creative Endeavor", Rank = 1},
                    new EmployeeActivityType {Type = "Teaching or Mentoring", Rank = 2},
                    new EmployeeActivityType {Type = "Award or Honor", Rank = 3},
                    new EmployeeActivityType {Type = "Conference Presentation or Proceeding", Rank = 4},
                    new EmployeeActivityType {Type = "Professional Development, Service or Consulting", Rank = 5}
                },
                OfferCountry = true,
                OfferActivityTypes = true,
                OfferFundingQuestions = true,
                InternationalPedigreeTitle = "My Formal Education Outside the US"
            });
        }
    }

    public abstract class BaseEmployeeModuleSettingsSeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEmployeeModuleSettings> _createEmployeeModuleSettings;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModule
            , IUnitOfWork unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _createEmployeeModuleSettings = createEmployeeModule;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected EmployeeModuleSettings Seed(CreateEmployeeModuleSettings command)
        {
            // make sure entity does not already exist
            var employeeModuleSettings = _queryProcessor.Execute(
                new EmployeeModuleSettingsByEstablishmentId(command.EstablishmentId));

            if (employeeModuleSettings != null) return employeeModuleSettings;

            _createEmployeeModuleSettings.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedEmployeeModuleSettings;
        }
    }

    public class EmployeeEntitySeeder : ISeedData
    {
        private readonly UcEmployeeSeeder _ucEmployeeSeeder;
        private readonly UsfEmployeeSeeder _usfEmployeeSeeder;

        public EmployeeEntitySeeder(UcEmployeeSeeder ucEmployeeSeeder
            , UsfEmployeeSeeder usfEmployeeSeeder
        )
        {
            _ucEmployeeSeeder = ucEmployeeSeeder;
            _usfEmployeeSeeder = usfEmployeeSeeder;
        }

        public void Seed()
        {
            _ucEmployeeSeeder.Seed();
            _usfEmployeeSeeder.Seed();
        }
    }

    public class UcEmployeeSeeder : BaseEmployeeSeeder
    {
        public UcEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
            : base(queryProcessor, createEmployee, unitOfWork, entities)
        {
        }

        public override void Seed()
        {
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Dan" && x.LastName == "Ludwig");
                if (person == null) throw new Exception("UC person not found.");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for UC.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                if (facultyRank == null) throw new Exception("UC Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "UCosmic CTO",
                    JobTitles = "Software Architect",
                    PersonId = person.RevisionId
                });
            }
            /*
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Saibal" && x.LastName == "Ghosh");
                if (person == null) throw new Exception("UC person not found.");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for UC.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                if (facultyRank == null) throw new Exception("UC Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "UCosmic Dev",
                    JobTitles = "UCosmic Dev",
                    PersonId = person.RevisionId
                });
            }
            */
            /* More employees ... */
        }
    }

    public class UsfEmployeeSeeder : BaseEmployeeSeeder
    {
        public UsfEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
            : base(queryProcessor, createEmployee, unitOfWork, entities)
        {
        }

        public override void Seed()
        {
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                if (facultyRank == null) throw new Exception("USF Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "USF World UCosmic Developer",
                    JobTitles = "Software Developer",
                    PersonId = person.RevisionId
                });
            }

            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Margaret" && x.LastName == "Kusenbach");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Associate Professor");
                if (facultyRank == null) throw new Exception("USF Associate Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "Director of Sociology Graduate Program",
                    JobTitles = "Director",
                    PersonId = person.RevisionId
                });
            }

            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "William" && x.LastName == "Hogarth");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                Seed(new CreateEmployee
                {
                    JobTitles = "Regional Chancellor",
                    PersonId = person.RevisionId
                });
            }

            /* More employees ... */
        }
    }

    public abstract class BaseEmployeeSeeder : ISeedData
    {
        protected IProcessQueries QueryProcessor { get; set; }
        private readonly IHandleCommands<CreateEmployee> _createEmployee;
        private readonly IUnitOfWork _unitOfWork;
        protected ICommandEntities Entities { get; set; }

        protected BaseEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
        {
            QueryProcessor = queryProcessor;
            _createEmployee = createEmployee;
            _unitOfWork = unitOfWork;
            Entities = entities;
        }

        public abstract void Seed();

        protected Employee Seed(CreateEmployee command)
        {
            // make sure entity does not already exist
            var employee = QueryProcessor.Execute(new EmployeeByPersonId(command.PersonId));

            if (employee != null) return employee;

            _createEmployee.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedEmployee;
        }
    }

}
