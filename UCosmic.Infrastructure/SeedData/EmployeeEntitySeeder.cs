using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class EmployeeModuleSettingsEntitySeeder : ISeedData
    {
        //private readonly UcEmployeeModuleSettingsSeeder _ucEmployeeModuleSettingsSeeder;
        private readonly UsfEmployeeModuleSettingsSeeder _usfEmployeeModuleSettingsSeeder;

        public EmployeeModuleSettingsEntitySeeder(
            UsfEmployeeModuleSettingsSeeder usfEmployeeModuleSettingsSeeder
            //,UcEmployeeModuleSettingsSeeder ucEmployeeModuleSettingsSeeder
        )
        {
            //_ucEmployeeModuleSettingsSeeder = ucEmployeeModuleSettingsSeeder;
            _usfEmployeeModuleSettingsSeeder = usfEmployeeModuleSettingsSeeder;
        }

        public void Seed()
        {
            //_ucEmployeeModuleSettingsSeeder.Seed();
            _usfEmployeeModuleSettingsSeeder.Seed();
        }
    }

#if false
    public class UcEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }

        public UcEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore
            )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork, binaryStore)
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
                new EmployeeFacultyRank {Rank = "Distinguished University Professor", Number = 1},
                new EmployeeFacultyRank {Rank = "Professor", Number = 2},
                new EmployeeFacultyRank {Rank = "Associate Professor", Number = 3},
                new EmployeeFacultyRank {Rank = "Assistant Professor", Number = 4},
                new EmployeeFacultyRank {Rank = "Other", Number = 5}
            },
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = null, //"My International",
                EstablishmentId = establishment.RevisionId,
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
#endif

    public class UsfEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryStore;
        private EmployeeModuleSettings CreatedEmployeeModuleSettings { get; set; }
        private readonly IHandleCommands<UpdateEmployeeModuleSettings> _updateEmployeeModuleSettings;

        public UsfEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore
        )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork, binaryStore)
        {
            _entities = entities;
            _binaryStore = binaryStore;
            _updateEmployeeModuleSettings = updateEmployeeModuleSettings;
        }

        internal static readonly IDictionary<string, Triple<string, string, Guid>> UsfActivityTypeIcons = new Dictionary<string, Triple<string, string, Guid>>
        {
            { "noun_project_762_idea.svg",      new Triple<string, string, Guid>("Research or Creative Endeavor",                    "Research.svg",     Guid.NewGuid()) },
            { "noun_project_14888_teacher.svg", new Triple<string, string, Guid>("Teaching or Mentoring",                            "Teaching.svg",     Guid.NewGuid()) },
            { "noun_project_17372_medal.svg",   new Triple<string, string, Guid>("Award or Honor",                                   "Award.svg",        Guid.NewGuid()) },
            { "noun_project_16986_podium.svg",  new Triple<string, string, Guid>("Conference Presentation or Proceeding",            "Conference.svg",   Guid.NewGuid()) },
            { "noun_project_401_briefcase.svg", new Triple<string, string, Guid>("Professional Development, Service or Consulting",  "Professional.svg", Guid.NewGuid()) },
        };

        internal static readonly IDictionary<string, Triple<string, string, Guid>> UsfEmployeeModuleSettingIcons = new Dictionary<string, Triple<string, string, Guid>>
        {
            { "global_24_black.png",            new Triple<string, string, Guid>("Global",    "GlobalViewIcon.png",   Guid.NewGuid()) },
            { "noun_project_5795_compass.svg",  new Triple<string, string, Guid>("Expert",    "FindAnExpertIcon.svg", Guid.NewGuid()) },
        };

        internal class Triple<TFirst, TSecond, TThird>
        {
            internal Triple(TFirst first, TSecond second, TThird third)
            {
                First = first;
                Second = second;
                Third = third;
            }

            internal TFirst First { get; private set; }
            internal TSecond Second { get; private set; }
            internal TThird Third { get; private set; }
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().Single(x => x.WebsiteUrl == "www.usf.edu");
            var settings = _entities.Get<EmployeeModuleSettings>().SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
            if (settings != null) return;

            #region CreateEmployeeModuleSettings

            CreatedEmployeeModuleSettings = Seed(new CreateEmployeeModuleSettings
            {
                EmployeeFacultyRanks = new Collection<EmployeeFacultyRank>
                {
                    new EmployeeFacultyRank {Rank = "Distinguished University Professor", Number = 1},
                    new EmployeeFacultyRank {Rank = "Professor", Number = 2},
                    new EmployeeFacultyRank {Rank = "Associate Professor", Number = 3},
                    new EmployeeFacultyRank {Rank = "Assistant Professor", Number = 4},
                    new EmployeeFacultyRank {Rank = "Other", Number = 5}
                },
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = "My USF Profile",
                EstablishmentId = establishment.RevisionId,
                EmployeeActivityTypes = new Collection<EmployeeActivityType>
                {
                    new EmployeeActivityType
                    {
                        Type = "Research or Creative Endeavor",
                        Rank = 1,
                        CssColor = "blue",
                    },
                    new EmployeeActivityType
                    {
                        Type = "Teaching or Mentoring",
                        Rank = 2,
                        CssColor = "green",
                    },
                    new EmployeeActivityType
                    {
                        Type = "Award or Honor",
                        Rank = 3,
                        CssColor = "yellow",
                    },
                    new EmployeeActivityType
                    {
                        Type = "Conference Presentation or Proceeding",
                        Rank = 4,
                        CssColor = "orange",
                    },
                    new EmployeeActivityType
                    {
                        Type = "Professional Development, Service or Consulting",
                        Rank = 5,
                        CssColor = "red",
                    }
                },
                OfferCountry = true,
                OfferActivityType = true,
                OfferFundingQuestions = true,
                InternationalPedigreeTitle = "My Formal Education Outside the US",
                ReportsDefaultYearRange = 10
            });

            #endregion
            #region ActivityType Icons

            var activityTypeIconBinaryPath = string.Format("{0}/{1}/{2}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                      CreatedEmployeeModuleSettings.Id,
                      EmployeeConsts.IconsBinaryStorePath);

            foreach (var fileName in UsfActivityTypeIcons.Keys)
            {
                var binaryFilePath = string.Format("{0}{1}",
                    activityTypeIconBinaryPath, UsfActivityTypeIcons[fileName].Third);

                if (_binaryStore.Get(binaryFilePath) == null)
                {
                    var localFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
                        @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\", fileName);

                    using (var fileStream = File.OpenRead(localFilePath))
                        _binaryStore.Put(binaryFilePath, fileStream.ReadFully());
                }

                var activityType = CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == UsfActivityTypeIcons[fileName].First);
                activityType.IconLength = _binaryStore.Get(binaryFilePath).Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = UsfActivityTypeIcons[fileName].Second;
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = UsfActivityTypeIcons[fileName].Third.ToString();
            }

            #endregion
            #region UpdateEmployeeModuleSettings

            var updateCommand = new UpdateEmployeeModuleSettings(CreatedEmployeeModuleSettings.Id)
            {
                EmployeeFacultyRanks = CreatedEmployeeModuleSettings.FacultyRanks,
                NotifyAdminOnUpdate = CreatedEmployeeModuleSettings.NotifyAdminOnUpdate,
                NotifyAdmins = CreatedEmployeeModuleSettings.NotifyAdmins,
                PersonalInfoAnchorText = CreatedEmployeeModuleSettings.PersonalInfoAnchorText,
                Establishment = CreatedEmployeeModuleSettings.Establishment,
                EmployeeActivityTypes = CreatedEmployeeModuleSettings.ActivityTypes,
                OfferCountry = CreatedEmployeeModuleSettings.OfferCountry,
                OfferActivityType = CreatedEmployeeModuleSettings.OfferActivityType,
                OfferFundingQuestions = CreatedEmployeeModuleSettings.OfferFundingQuestions,
                InternationalPedigreeTitle = CreatedEmployeeModuleSettings.InternationalPedigreeTitle
            };

            #endregion

            _updateEmployeeModuleSettings.Handle(updateCommand);
        }
    }

    public abstract class BaseEmployeeModuleSettingsSeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEmployeeModuleSettings> _createEmployeeModuleSettings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryStore;


        protected BaseEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModule
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore)
        {
            _queryProcessor = queryProcessor;
            _createEmployeeModuleSettings = createEmployeeModule;
            _unitOfWork = unitOfWork;
            _binaryStore = binaryStore;
        }

        public abstract void Seed();

        protected EmployeeModuleSettings Seed(CreateEmployeeModuleSettings command)
        {
            // make sure entity does not already exist
            var employeeModuleSettings = _queryProcessor.Execute(
                new EmployeeModuleSettingsByEstablishmentId(command.EstablishmentId, true));
            if (employeeModuleSettings != null) return employeeModuleSettings;

            var iconsBinaryPath = string.Format("{0}/{1}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                      EmployeeConsts.IconsBinaryStorePath);

            foreach (var icon in UsfEmployeeModuleSettingsSeeder.UsfEmployeeModuleSettingIcons)
            {
                var iconPath = Path.Combine(iconsBinaryPath, icon.Value.Third.ToString());
                if (!_binaryStore.Exists(iconPath))
                {
                    var filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                    @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\",
                                                    icon.Key);

                    using (var fileStream = File.OpenRead(filePath))
                        _binaryStore.Put(iconPath, fileStream.ReadFully());
                }

                if (string.IsNullOrEmpty(command.GlobalViewIconPath) && icon.Value.First == "Global")
                {
                    command.GlobalViewIconFileName = icon.Value.Third.ToString();
                    command.GlobalViewIconLength = _binaryStore.Get(iconPath).Length;
                    command.GlobalViewIconMimeType = "image/png";
                    command.GlobalViewIconName = icon.Value.Second;
                    command.GlobalViewIconPath = iconsBinaryPath;
                }

                if (string.IsNullOrEmpty(command.FindAnExpertIconPath) && icon.Value.First == "Expert")
                {
                    command.FindAnExpertIconFileName = icon.Value.Third.ToString();
                    command.FindAnExpertIconLength = _binaryStore.Get(iconPath).Length;
                    command.FindAnExpertIconMimeType = "image/svg+xml";
                    command.FindAnExpertIconName = icon.Value.Second;
                    command.FindAnExpertIconPath = iconsBinaryPath;
                }
            }

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

                //EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                //if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for UC.");

                //EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                //if (facultyRank == null) throw new Exception("UC Professor rank not found.");

                Seed(new CreateEmployee
                {
                    //                    FacultyRankId = facultyRank.Id,
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
