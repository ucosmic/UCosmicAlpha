using UCosmic.Domain.Activities;

namespace UCosmic.EntityFramework
{
    public class ActivityOrm : RevisableEntityTypeConfiguration<Activity>
    {
        public ActivityOrm()
        {
            ToTable(typeof(Activity).Name, DbSchemaName.ActivitiesV2);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.Values)
                .WithRequired(d => d.Activity)
                .HasForeignKey(d => d.ActivityId)
                .WillCascadeOnDelete(true);

            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);
            Property(p => p.EditSourceId).IsOptional();

            Ignore(p => p.Mode);
        }
    }

    public class ActivityValuesOrm : RevisableEntityTypeConfiguration<ActivityValues>
    {
        public ActivityValuesOrm()
        {
            ToTable(typeof(ActivityValues).Name, DbSchemaName.ActivitiesV2);

            HasMany(p => p.Locations)
                .WithRequired(d => d.ActivityValues)
                .HasForeignKey(d => d.ActivityValuesId)
                .WillCascadeOnDelete(true);

            HasMany(p => p.Types)
                .WithRequired(d => d.ActivityValues)
                .HasForeignKey(d => d.ActivityValuesId)
                .WillCascadeOnDelete(true);

            HasMany(p => p.Tags)
                .WithRequired(d => d.ActivityValues)
                .HasForeignKey(d => d.ActivityValuesId)
                .WillCascadeOnDelete(true);

            HasMany(p => p.Documents)
                .WithRequired(d => d.ActivityValues)
                .HasForeignKey(d => d.ActivityValuesId)
                .WillCascadeOnDelete(true);

            Property(p => p.Title).HasMaxLength(200);
            Property(p => p.Content).HasColumnType("ntext");
            Property(p => p.StartsOn).IsOptional();
            Property(p => p.EndsOn).IsOptional();
            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);
            Property(p => p.WasExternallyFunded).IsOptional();
            Property(p => p.WasInternallyFunded).IsOptional();

            Ignore(p => p.Mode);
        }
    }

    public class ActivityLocationOrm : RevisableEntityTypeConfiguration<ActivityLocation>
    {
        public ActivityLocationOrm()
        {
            ToTable(typeof (ActivityLocation).Name, DbSchemaName.ActivitiesV2);

            // ActivityLocation 1 ---> 1 Place
            // Place * ---> 1 ActivityLocation
            HasRequired(p => p.Place)
                .WithMany()
                .HasForeignKey(d => d.PlaceId)
                .WillCascadeOnDelete(false);
        }
    }

    public class ActivityTagOrm : RevisableEntityTypeConfiguration<ActivityTag>
    {
        public ActivityTagOrm()
        {
            ToTable(typeof(ActivityTag).Name, DbSchemaName.ActivitiesV2);

            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(20);
            Property(p => p.DomainTypeText).HasColumnName("DomainType").IsRequired().HasMaxLength(20);
            Property(p => p.Text).IsRequired().HasMaxLength(500);

            Ignore(p => p.Mode);
            Ignore(p => p.DomainType);
        }
    }

    public class ActivityTypeOrm : RevisableEntityTypeConfiguration<ActivityType>
    {
        public ActivityTypeOrm()
        {
            ToTable(typeof(ActivityType).Name, DbSchemaName.ActivitiesV2);

            HasRequired(p => p.Type)
                .WithMany()
                .HasForeignKey(d => d.TypeId)
                .WillCascadeOnDelete(false);
        }
    }

    public class ActivityDocumentOrm : RevisableEntityTypeConfiguration<ActivityDocument>
    {
        public ActivityDocumentOrm()
        {
            ToTable(typeof(ActivityDocument).Name, DbSchemaName.ActivitiesV2);

            HasOptional(p => p.File)
                .WithMany()
                .HasForeignKey(p => p.FileId)
                .WillCascadeOnDelete(false);

            HasOptional(p => p.Image)
                .WithMany()
                .HasForeignKey(p => p.ImageId)
                .WillCascadeOnDelete(false);

            Property(p => p.ModeText).HasColumnName("Mode").IsRequired().HasMaxLength(ActivityDocumentConstraints.ModeTextMaxLength);
            Property(p => p.Title).IsRequired().HasMaxLength(ActivityDocumentConstraints.MaxTitleLength);

            Ignore(p => p.Mode);
        }
    }
}
