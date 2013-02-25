using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Activities;

namespace UCosmic.EntityFramework
{
    public class ActivityOrm : EntityTypeConfiguration<Activity>
    {
        public ActivityOrm()
        {
            ToTable(typeof(Activity).Name, DbSchemaName.ActivitiesV2);

            HasKey(p => p.Id);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasRequired(d => d.UpdatedByUser)
                .WithMany()
                .HasForeignKey(d => d.UpdatedByUserId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.Values)
                .WithRequired(d => d.Activity)
                .HasForeignKey(d => d.ActivityId)
                .WillCascadeOnDelete(true);

            HasMany(p => p.Tags)
                .WithRequired(d => d.Activity)
                .HasForeignKey(d => d.ActivityId)
                .WillCascadeOnDelete(true); 
            
            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);

            Ignore(p => p.Mode);
        }
    }

    public class ActivityValuesOrm : EntityTypeConfiguration<ActivityValues>
    {
        public ActivityValuesOrm()
        {
            ToTable(typeof(ActivityValues).Name, DbSchemaName.ActivitiesV2);

            HasKey(p => p.Id);

            HasMany(p => p.Locations)
                .WithRequired(d => d.ActivityValues)
                .HasForeignKey(d => d.ActivityValuesId)
                .WillCascadeOnDelete(true);

            Property(p => p.Title).HasColumnName("Title").HasMaxLength(200);
            Property(p => p.Content).HasColumnName("Content").HasColumnType("ntext");
            Property(p => p.StartsOn).HasColumnName("StartsOn").IsOptional();
            Property(p => p.EndsOn).HasColumnName("EndsOn").IsOptional();
            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);

            Ignore(p => p.Mode);
        }
    }

    public class ActivityLocationOrm : EntityTypeConfiguration<ActivityLocation>
    {
        public ActivityLocationOrm()
        {
            ToTable(typeof (ActivityLocation).Name, DbSchemaName.ActivitiesV2);

            HasKey(p => p.Id);

            // ActivityLocation 1 ---> 1 Place
            // Place * ---> 1 ActivityLocation
            HasRequired(p => p.Place)
                .WithMany()
                .HasForeignKey(d => d.PlaceId)
                .WillCascadeOnDelete(false);        
        }
    }

    public class ActivityTagOrm : EntityTypeConfiguration<ActivityTag>
    {
        public ActivityTagOrm()
        {
            ToTable(typeof(ActivityTag).Name, DbSchemaName.ActivitiesV2);

            HasKey(p => p.Id);

            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);
            Property(p => p.DomainTypeText).HasColumnName("DomainType").IsRequired().HasMaxLength(20);
            Property(p => p.Text).IsRequired().HasMaxLength(500);
            Property(p => p.IsInstitution).HasColumnName("IsInstitution");

            Ignore(p => p.Mode);
            Ignore(p => p.DomainType);
        }
    }

    public class ActivityTypeOrm : EntityTypeConfiguration<ActivityType>
    {
        public ActivityTypeOrm()
        {
            ToTable(typeof(ActivityType).Name, DbSchemaName.ActivitiesV2);

            HasKey(p => p.Id);

            Property(p => p.Type).IsRequired().HasMaxLength(ActivityConstraints.TypeMaxLength);
        }
    }
}
