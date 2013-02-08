using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Employees;

namespace UCosmic.EntityFramework
{
    public class EmployeeOrm : EntityTypeConfiguration<Employee>
    {
        public EmployeeOrm()
        {
            ToTable(typeof(Employee).Name, DbSchemaName.Employees);

            HasRequired(p => p.Person)
                .WithOptional(d => d.Employee)
                .Map(m => m.MapKey("PersonId"))
                .WillCascadeOnDelete(true)
            ;

            HasOptional(p => p.FacultyRank);

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
                .WithOptional(d => d.EmployeeModuleSettings) // tell EF that EmployeeModuleSettings belongs to exactly 1 Establishment
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
            
            Property(p => p.PersonalInfoAnchorText).HasMaxLength(64);
        }
    }

    public class EmployeeFacultyRankOrm : EntityTypeConfiguration<EmployeeFacultyRank>
    {
        public EmployeeFacultyRankOrm()
        {
            ToTable(typeof(EmployeeFacultyRank).Name, DbSchemaName.Employees);

            Property(p => p.Rank).IsRequired().HasMaxLength(EmployeeFacultyRankConstraints.RankMaxLength);
        }
    }
}
