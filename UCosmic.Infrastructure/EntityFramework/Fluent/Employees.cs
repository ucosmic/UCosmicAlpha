using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Employees;

namespace UCosmic.EntityFramework
{
    public class EmployeeOrm : EntityTypeConfiguration<Employee>
    {
        public EmployeeOrm()
        {
            ToTable(typeof(Employee).Name, DbSchemaName.Employees);

            HasRequired(d => d.Person)
                .WithOptional(p => p.Employee)
                .Map(m => m.MapKey("PersonId"))
                .WillCascadeOnDelete(true)
            ;

            HasOptional(p => p.FacultyRank)
                .WithMany()
                .Map(m => m.MapKey("FacultyRankId"))
            ;

            Property(p => p.AdministrativeAppointments).HasMaxLength(500).IsOptional();
            Property(p => p.JobTitles).HasMaxLength(500).IsOptional();
        }
    }
  
    public class EmployeeModuleSettingsOrm : EntityTypeConfiguration<EmployeeModuleSettings>
    {
        public EmployeeModuleSettingsOrm()
        {
            ToTable(typeof(EmployeeModuleSettings).Name, DbSchemaName.Employees);

            HasRequired(p => p.Establishment)
                .WithOptional() // tell EF that EmployeeModuleSettings belongs to exactly 1 Establishment
                .Map(m => m.MapKey("EstablishmentId")) // give DB a friendlier fk column name
                .WillCascadeOnDelete(false) // don't delete Establishments when deleting an EmployeeModuleSettings
            ;

            HasMany(p => p.FacultyRanks)
                .WithOptional()
                .Map(m => m.MapKey("EmployeeModuleSettingsId"))
                .WillCascadeOnDelete(false);

            HasMany(p => p.NotifyAdmins)
                .WithMany()
                .Map(m => m.ToTable("EmployeeModuleSettingsNotifyingAdmins", DbSchemaName.Employees)
                    .MapLeftKey("EmployeeModuleSettingsId").MapRightKey("PersonId"));

            HasMany(p => p.ActivityTypes)
                .WithOptional()
                .Map(m => m.MapKey("EmployeeModuleSettingsId"))
                .WillCascadeOnDelete(true); 
            
            Property(p => p.PersonalInfoAnchorText).HasMaxLength(64);
            Property(p => p.InternationalPedigreeTitle).HasMaxLength(64);
        }
    }

    public class EmployeeFacultyRankOrm : EntityTypeConfiguration<EmployeeFacultyRank>
    {
        public EmployeeFacultyRankOrm()
        {
            ToTable(typeof(EmployeeFacultyRank).Name, DbSchemaName.Employees);

            Property(p => p.Rank).IsRequired().HasMaxLength(EmployeeFacultyRankConstraints.RankMaxLength);
            Property(p => p.Number).IsOptional();
        }
    }

    public class EmployeeActivityTypeOrm : EntityTypeConfiguration<EmployeeActivityType>
    {
        public EmployeeActivityTypeOrm()
        {
            ToTable(typeof(EmployeeActivityType).Name, DbSchemaName.Employees);

            Property(p => p.Type).IsRequired().HasMaxLength(EmployeeFacultyRankConstraints.ActivityTypeMaxLength);
        }
    }
}
