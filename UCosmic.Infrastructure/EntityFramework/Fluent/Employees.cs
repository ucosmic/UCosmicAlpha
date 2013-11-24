using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Employees;

namespace UCosmic.EntityFramework
{
    public class EmployeeModuleSettingsOrm : EntityTypeConfiguration<EmployeeModuleSettings>
    {
        public EmployeeModuleSettingsOrm()
        {
            ToTable(typeof(EmployeeModuleSettings).Name, DbSchemaName.Employees);

            HasKey(x => x.EstablishmentId);

            HasRequired(d => d.Establishment)
                .WithOptional() // tell EF that EmployeeModuleSettings belongs to exactly 1 Establishment
                //.Map(m => m.MapKey("EstablishmentId")) // give DB a friendlier fk column name
                .WillCascadeOnDelete(false) // don't delete Establishments when deleting an EmployeeModuleSettings
            ;

            HasMany(p => p.FacultyRanks)
                .WithRequired(d => d.Settings)
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.NotifyAdmins)
                .WithMany()
                .Map(m => m.ToTable("EmployeeModuleSettingsNotifyingAdmins", DbSchemaName.Employees)
                    .MapLeftKey("EmployeeModuleSettingsId").MapRightKey("PersonId"));

            HasMany(p => p.ActivityTypes)
                .WithOptional(d => d.Settings)
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(true);

            Property(x => x.EstablishmentId);
            
            Property(p => p.PersonalInfoAnchorText).HasMaxLength(64);
            Property(p => p.InternationalPedigreeTitle).HasMaxLength(64);
            Property(p => p.ReportsDefaultYearRange).IsOptional();

            Property(x => x.GlobalViewIconLength).IsOptional();
            Property(x => x.GlobalViewIconMimeType).IsOptional();
            Property(x => x.GlobalViewIconPath).IsOptional();
            Property(x => x.GlobalViewIconFileName).HasMaxLength(FileConstraints.FileNameMaxLength).IsOptional();
            Property(x => x.GlobalViewIconName).HasMaxLength(FileConstraints.NameMaxLength).IsOptional();

            Property(x => x.FindAnExpertIconLength).IsOptional();
            Property(x => x.FindAnExpertIconMimeType).IsOptional();
            Property(x => x.FindAnExpertIconPath).IsOptional();
            Property(x => x.FindAnExpertIconFileName).HasMaxLength(FileConstraints.FileNameMaxLength).IsOptional();
            Property(x => x.FindAnExpertIconName).HasMaxLength(FileConstraints.NameMaxLength).IsOptional();
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
            Property(p => p.CssColor).IsOptional();
            Property(x => x.IconLength).IsOptional();
            Property(x => x.IconMimeType).IsOptional();
            Property(x => x.IconPath).IsOptional();
            Property(x => x.IconFileName).HasMaxLength(FileConstraints.FileNameMaxLength).IsOptional();
            Property(x => x.IconName).HasMaxLength(FileConstraints.NameMaxLength).IsOptional();
        }
    }
}
