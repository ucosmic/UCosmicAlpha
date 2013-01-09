using System.Collections.ObjectModel;
using System.Security.Principal;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;

namespace UCosmic.SeedData
{
    public class EmployeeEntitySeeder : ISeedData
    {
        private readonly EmployeeFacultyRankSeeder _employeeFacultyRankSeeder;
        private readonly EmployeeModuleSettingsSeeder _employeeModuleSettingsSeeder;

        public EmployeeEntitySeeder(EmployeeFacultyRankSeeder inEmployeeFacultyRankSeeder
            , EmployeeModuleSettingsSeeder inEmployeeModuleSettingsSeeder
        )
        {
            _employeeFacultyRankSeeder = inEmployeeFacultyRankSeeder;
            _employeeModuleSettingsSeeder = inEmployeeModuleSettingsSeeder;
        }

        public void Seed()
        {
            _employeeFacultyRankSeeder.Seed();
            _employeeModuleSettingsSeeder.Seed();
        }
    }

    public class EmployeeFacultyRankSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICommandEntities _commandEntities;

        public EmployeeFacultyRankSeeder(IUnitOfWork inUnitOfWork
            , ICommandEntities inCommandEntities )
        {
            _unitOfWork = inUnitOfWork;
            _commandEntities = inCommandEntities;
        }

        public void Seed()
        {
            var entity = new EmployeeFacultyRank {Rank = "Adjunct Instructor"};
            _commandEntities.Create(entity);
            entity = new EmployeeFacultyRank {Rank = "Assistant Professor"};
            _commandEntities.Create(entity);
            entity = new EmployeeFacultyRank {Rank = "Associate Professor"};
            _commandEntities.Create(entity);
            entity = new EmployeeFacultyRank {Rank = "Professor"};
            _commandEntities.Create(entity);
            entity = new EmployeeFacultyRank {Rank = "Distinquished Professor"};
            _commandEntities.Create(entity);

            _unitOfWork.SaveChanges();
        }
    }

    public class EmployeeModuleSettingsSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICommandEntities _commandEntities;

        public EmployeeModuleSettingsSeeder(IUnitOfWork inUnitOfWork
            , ICommandEntities inCommandEntities )
        {
            _unitOfWork = inUnitOfWork;
            _commandEntities = inCommandEntities;
        }
        
        public void Seed()
        {
            /*  TODO */
        }
    }

}
