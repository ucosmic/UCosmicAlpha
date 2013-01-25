using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Employees;

namespace UCosmic.EntityFramework
{
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

            HasOptional(p => p.NotifyAdmin);
            
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
