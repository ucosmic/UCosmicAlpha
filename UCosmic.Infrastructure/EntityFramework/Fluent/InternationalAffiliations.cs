using UCosmic.Domain;
using UCosmic.Domain.InternationalAffiliations;

namespace UCosmic.EntityFramework
{
    public class InternationalAffiliationOrm : RevisableEntityTypeConfiguration<InternationalAffiliation>
    {
        public InternationalAffiliationOrm()
        {
            ToTable(typeof (InternationalAffiliation).Name, DbSchemaName.Employees);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.Locations)
                .WithRequired(d => d.InternationalAffiliation)
                .HasForeignKey(d => d.InternationalAffiliationId)
                .WillCascadeOnDelete(true);

            Property(p => p.From).IsRequired();
            Property(p => p.To).IsOptional();
            Property(p => p.OnGoing).IsRequired();
            Property(p => p.Institution).IsOptional().HasMaxLength(200);
            Property(p => p.Position).IsOptional().HasMaxLength(100);
        }
    }

    public class AffiliationLocationOrm : RevisableEntityTypeConfiguration<InternationalAffiliationLocation>
    {
        public AffiliationLocationOrm()
        {
            ToTable(typeof (InternationalAffiliationLocation).Name, DbSchemaName.Employees);

            HasRequired(d => d.InternationalAffiliation)
                .WithMany()
                .HasForeignKey(d => d.InternationalAffiliationId)
                .WillCascadeOnDelete(true);

            HasRequired(p => p.Place)
                .WithMany()
                .HasForeignKey(d => d.PlaceId)
                .WillCascadeOnDelete(false);
        }
    }
}