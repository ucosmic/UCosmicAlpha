using UCosmic.Domain.GeographicExpertises;

namespace UCosmic.EntityFramework
{
    public class GeographicExpertiseOrm : RevisableEntityTypeConfiguration<GeographicExpertise>
    {
        public GeographicExpertiseOrm()
        {
            ToTable(typeof (GeographicExpertise).Name, DbSchemaName.GeographicExpertises);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasRequired(d => d.Place)
                .WithMany()
                .HasForeignKey(d => d.PlaceId)
                .WillCascadeOnDelete(false);

            Property(p => p.Description).IsOptional().HasMaxLength(400);
        }
    }
}