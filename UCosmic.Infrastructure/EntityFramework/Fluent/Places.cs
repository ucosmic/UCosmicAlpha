using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Places;

namespace UCosmic.EntityFramework
{
    public class CoordinatesOrm : ComplexTypeConfiguration<Coordinates>
    {
    }

    public class BoundingBoxOrm : ComplexTypeConfiguration<BoundingBox>
    {
    }

    public class PlaceOrm : RevisableEntityTypeConfiguration<Place>
    {
        public PlaceOrm()
        {
            ToTable(typeof(Place).Name, DbSchemaName.Places);

            // ParentPlace 0..1 <---> * ChildPlace
            HasOptional(d => d.Parent)
                .WithMany(p => p.Children)
                .HasForeignKey(d => d.ParentId)
                .WillCascadeOnDelete(false);

            HasMany(p => p.Components)
                .WithMany(p => p.Composites)
                .Map(x => x.ToTable("PlaceComposition", DbSchemaName.Places).MapLeftKey("CompositeId").MapRightKey("ComponentId"));

            // name properties
            Property(p => p.OfficialName).IsRequired().HasMaxLength(200);
            Property(p => p.Center.Latitude).HasColumnName("Latitude");
            Property(p => p.Center.Longitude).HasColumnName("Longitude");
            Property(p => p.BoundingBox.Northeast.Latitude).HasColumnName("NorthLatitude");
            Property(p => p.BoundingBox.Northeast.Longitude).HasColumnName("EastLongitude");
            Property(p => p.BoundingBox.Southwest.Latitude).HasColumnName("SouthLatitude");
            Property(p => p.BoundingBox.Southwest.Longitude).HasColumnName("WestLongitude");
        }
    }

    public class PlaceNodeOrm : EntityTypeConfiguration<PlaceNode>
    {
        public PlaceNodeOrm()
        {
            ToTable(typeof(PlaceNode).Name, DbSchemaName.Places);

            Ignore(x => x.Id);
            HasKey(p => new { p.AncestorId, p.OffspringId });

            // AncestorToponym * <---> * OffspringToponym
            HasRequired(d => d.Ancestor)
                .WithMany(p => p.Offspring)
                .HasForeignKey(d => d.AncestorId)
                .WillCascadeOnDelete(false);
            HasRequired(d => d.Offspring)
                .WithMany(p => p.Ancestors)
                .HasForeignKey(d => d.OffspringId)
                .WillCascadeOnDelete(false);
        }
    }

    public class PlaceNameOrm : RevisableEntityTypeConfiguration<PlaceName>
    {
        public PlaceNameOrm()
        {
            ToTable(typeof(PlaceName).Name, DbSchemaName.Places);

            // map properties
            Property(p => p.AsciiEquivalent).IsUnicode(false);
            Property(p => p.TranslationToHint).IsUnicode(false).HasMaxLength(10);
            Property(p => p.Text).IsRequired().HasMaxLength(250);
            Property(p => p.AsciiEquivalent).HasMaxLength(250);

            // PlaceName * <---> 1 Place
            HasRequired(d => d.NameFor)
                .WithMany(p => p.Names)
                .Map(x => x.MapKey("NameForPlaceId"))
                .WillCascadeOnDelete(true);

            // PlaceName * <---> 0..1 TranslationToLanguage
            HasOptional(d => d.TranslationToLanguage)
                .WithMany()
                .Map(x => x.MapKey("TranslationToLanguageId"))
                .WillCascadeOnDelete(false);
        }
    }
}
