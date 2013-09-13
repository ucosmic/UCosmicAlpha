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
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }
        private readonly IHandleCommands<UpdateEmployeeModuleSettings> _updateEmployeeModuleSettings;
        private string[] _activityTypeFilenames;
        private IDictionary<string, string> _activityTypeFilenameMap;
        private string _activityTypeIconBinaryPath;

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

        private void MakeIconBinaryStorePaths(int employeeModuleSettingsId)
        {
            _activityTypeFilenames = new string[]
            {
                "noun_project_762_idea.svg",
                "noun_project_14888_teacher.svg",
                "noun_project_17372_medal.svg",
                "noun_project_16986_podium.svg",
                "noun_project_401_briefcase.svg"
            };

            _activityTypeFilenameMap = new Dictionary<string, string>
            {
                { "noun_project_762_idea.svg", "5117FFC4-C3CD-42F8-9C68-6B4362930A99" },
                { "noun_project_14888_teacher.svg", "0033E48C-95CD-487B-8B0D-571E71EFF844" },
                { "noun_project_17372_medal.svg", "8C746B8A-6B24-4881-9D4D-D830FBCD723A" },
                { "noun_project_16986_podium.svg", "E44978F8-3664-4F7A-A2AF-6A0446D38099" },
                { "noun_project_401_briefcase.svg", "586DDDBB-DE01-429B-8428-57A9D03189CB" }
            };

            _activityTypeIconBinaryPath = string.Format("{0}/{1}/{2}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                  employeeModuleSettingsId,
                                  EmployeeConsts.IconsBinaryStorePath);       
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName.Contains("University of South Florida"));
            if (establishment == null) throw new Exception("Establishment is null");

            var settings = _entities.Get<EmployeeModuleSettings>().SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
            if (settings != null)
            {
                return; 
            }

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



            MakeIconBinaryStorePaths(CreatedEmployeeModuleSettings.Id);

            for (var i = 0; i < _activityTypeFilenames.Length; i += 1)
            {
                string iconBinaryFilePath =
                    String.Format("{0}{1}", _activityTypeIconBinaryPath,
                                  _activityTypeFilenameMap[_activityTypeFilenames[i]]);

                if (_binaryStore.Get(iconBinaryFilePath) == null)
                {
                    string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                    @"..\UCosmic.Web.MVC\images\icons\nounproject\",
                                                    _activityTypeFilenames[i]);

                    using (var fileStream = File.OpenRead(filePath))
                    {
                        var content = fileStream.ReadFully();
                        _binaryStore.Put(iconBinaryFilePath, content);
                    }
                }
            }

            EmployeeActivityType activityType;

            activityType =
                CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == "Research or Creative Endeavor");
            activityType.IconLength = _binaryStore.Get(_activityTypeIconBinaryPath + _activityTypeFilenameMap["noun_project_762_idea.svg"]).Length;
            activityType.IconMimeType = "image/svg+xml";
            activityType.IconName = "Research.svg";
            activityType.IconPath = _activityTypeIconBinaryPath;
            activityType.IconFileName = _activityTypeFilenameMap["noun_project_762_idea.svg"];

            activityType = 
                CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == "Teaching or Mentoring");
            activityType.IconLength = _binaryStore.Get(_activityTypeIconBinaryPath + _activityTypeFilenameMap["noun_project_14888_teacher.svg"]).Length;
            activityType.IconMimeType = "image/svg+xml";
            activityType.IconName = "Teaching.svg";
            activityType.IconPath = _activityTypeIconBinaryPath;
            activityType.IconFileName = _activityTypeFilenameMap["noun_project_14888_teacher.svg"];

            activityType =
                CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == "Award or Honor");
            activityType.IconLength = _binaryStore.Get(_activityTypeIconBinaryPath + _activityTypeFilenameMap["noun_project_17372_medal.svg"]).Length;
            activityType.IconMimeType = "image/svg+xml";
            activityType.IconName = "Award.svg";
            activityType.IconPath = _activityTypeIconBinaryPath;
            activityType.IconFileName = _activityTypeFilenameMap["noun_project_17372_medal.svg"];

            activityType =
                CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == "Conference Presentation or Proceeding");
            activityType.IconLength =
                _binaryStore.Get(_activityTypeIconBinaryPath + _activityTypeFilenameMap["noun_project_16986_podium.svg"]).Length;
            activityType.IconMimeType = "image/svg+xml";
            activityType.IconName = "Conference.svg";
            activityType.IconPath = _activityTypeIconBinaryPath;
            activityType.IconFileName = _activityTypeFilenameMap["noun_project_16986_podium.svg"];

            activityType =
                CreatedEmployeeModuleSettings.ActivityTypes.Single(a => a.Type == "Professional Development, Service or Consulting");
            activityType.IconLength =
                _binaryStore.Get(_activityTypeIconBinaryPath + _activityTypeFilenameMap["noun_project_401_briefcase.svg"]).Length;
            activityType.IconMimeType = "image/svg+xml";
            activityType.IconName = "Professional.svg";
            activityType.IconPath = _activityTypeIconBinaryPath;
            activityType.IconFileName = _activityTypeFilenameMap["noun_project_401_briefcase.svg"];

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

            /* Create default Global View icon */
            if (_binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid) == null)
            {
                string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                @"..\UCosmic.Web.Mvc\images\icons\global\",
                                                "global_24_black.png");

                using (var fileStream = File.OpenRead(filePath))
                {
                    var content = fileStream.ReadFully();
                    _binaryStore.Put(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid, content);
                }                
            }

            /* Create default Find an Expert icon */
            if (_binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid) == null)
            {
                var filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                             @"..\UCosmic.Web.Mvc\images\icons\nounproject\",
                                             "noun_project_5795_compass.svg");
                using (var fileStream = File.OpenRead(filePath))
                {
                    var content = fileStream.ReadFully();
                    _binaryStore.Put(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid, content);
                }
            }

            if (String.IsNullOrEmpty(command.GlobalViewIconPath))
            {
                command.GlobalViewIconFileName = EmployeeConsts.DefaultGlobalViewIconGuid;
                command.GlobalViewIconLength = _binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid).Length;
                command.GlobalViewIconMimeType = "image/png";
                command.GlobalViewIconName = "GlobalViewIcon.png";
                command.GlobalViewIconPath = iconsBinaryPath;
            }

            if (String.IsNullOrEmpty(command.FindAnExpertIconPath))
            {
                command.FindAnExpertIconFileName = EmployeeConsts.DefaultFindAnExpertIconGuid;
                command.FindAnExpertIconLength = _binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid).Length;
                command.FindAnExpertIconMimeType = "image/svg+xml";
                command.FindAnExpertIconName = "FindAnExpertIcon.svg";
                command.FindAnExpertIconPath = iconsBinaryPath;
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
