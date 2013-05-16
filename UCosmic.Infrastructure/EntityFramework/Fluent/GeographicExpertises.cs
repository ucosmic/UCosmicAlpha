using UCosmic.Domain.GeographicExpertises;

namespace UCosmic.EntityFramework
{
    public class GeographicExpertiseOrm : RevisableEntityTypeConfiguration<GeographicExpertise>
    {
        public GeographicExpertiseOrm()
        {
            ToTable(typeof (GeographicExpertise).Name, DbSchemaName.Employees);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.Locations)
                .WithRequired(d => d.Expertise)
                .HasForeignKey(d => d.ExpertiseId)
                .WillCascadeOnDelete(true);

            Property(p => p.Description).IsOptional().HasMaxLength(400);
        }


    }

    public class GeographicExpertiseLocationOrm : RevisableEntityTypeConfiguration<GeographicExpertiseLocation>
    {
        public GeographicExpertiseLocationOrm()
        {
            ToTable(typeof (GeographicExpertiseLocation).Name, DbSchemaName.Employees);

            HasRequired(d => d.Expertise)
                .WithMany()
                .HasForeignKey(d => d.ExpertiseId)
                .WillCascadeOnDelete(true);

            HasRequired(p => p.Place)
                .WithMany()
                .HasForeignKey(d => d.PlaceId)
                .WillCascadeOnDelete(false);
        }
    }
}