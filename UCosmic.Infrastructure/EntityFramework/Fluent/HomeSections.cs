using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Home;

namespace UCosmic.EntityFramework
{
    public class HomeSectionOrm : EntityTypeConfiguration<HomeSection>
    {
        public HomeSectionOrm()
        {
            ToTable(typeof(HomeSection).Name, DbSchemaName.HomeSection);

            // has one establishment
            HasOptional(d => d.Establishment)
                .WithMany()
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete();

            //HasOptional(d => d.ForEstablishment)
            //    .WithMany()
            //    .HasForeignKey(d => d.ForEstablishmentId)
            //    .WillCascadeOnDelete();

            // has one photo
            //HasRequired(d => d.Photo)
            //    .WithMany()
            //    .Map(m => m.MapKey("PhotoId"))
            //    .WillCascadeOnDelete(true)
            //;

            // has zero or one photo
            HasOptional(d => d.Photo)
                .WithOptionalDependent()
                .Map(m => m.MapKey("PhotoId"))
                .WillCascadeOnDelete(false)
            ;

            // has one or more homelinks
            HasMany(p => p.Links)
                .WithRequired(d => d.HomeSection)
                .HasForeignKey(d => d.HomeSectionId)
                .WillCascadeOnDelete(true)
            ;
            Property(p => p.Title).IsRequired();
            Property(p => p.Description).IsRequired();
        }
    }
    
    public class HomeLinkOrm : EntityTypeConfiguration<HomeLink>
    {
        public HomeLinkOrm()
        {
            ToTable(typeof(HomeLink).Name, DbSchemaName.HomeSection);

            //HasKey(p => new { p.Id });

            Property(p => p.Url).IsRequired();
            Property(p => p.Text).IsRequired();
        }
    }
}
