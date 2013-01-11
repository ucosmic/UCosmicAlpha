using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Employees;

namespace UCosmic.EntityFramework
{
    public class EmployeeModuleSettingsOrm : EntityTypeConfiguration<EmployeeModuleSettings>
    {
        public EmployeeModuleSettingsOrm()
        {
            ToTable(typeof(EmployeeModuleSettings).Name, DbSchemaName.Employees);

            HasMany(p => p.FacultyRanks)
                .WithRequired()
                .Map(m => m.MapKey("ForSettingsId"));

            HasOptional(p => p.NotifyAdmin);
            HasRequired(p => p.ForEstablishment);

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
