using System;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;


namespace UCosmic.SeedData
{
    public class EmployeeEntitySeeder : ISeedData
    {
        private readonly UcEmployeeModuleSettingsSeeder _ucEmployeeModuleSettingsSeeder;
        private readonly UsfEmployeeModuleSettingsSeeder _usfEmployeeModuleSettingsSeeder;

        public EmployeeEntitySeeder(UcEmployeeModuleSettingsSeeder ucEmployeeModuleSettingsSeeder
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
            Seed(new CreateEmployeeModuleSettings
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
                PersonalInfoAnchorText = "My International",
                ForEstablishmentId = establishment.RevisionId,
            });
        }
    }

    public class UsfEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;

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
            Seed(new CreateEmployeeModuleSettings
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
                ForEstablishmentId = establishment.RevisionId,
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
                new EmployeeModuleSettingsByEstablishmentId(command.ForEstablishmentId));

            if (employeeModuleSettings != null) return employeeModuleSettings;

            _createEmployeeModuleSettings.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedEmployeeModuleSettings;
        }
    }

}
