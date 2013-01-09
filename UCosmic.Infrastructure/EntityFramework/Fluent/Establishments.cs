using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Establishments;

namespace UCosmic.EntityFramework
{
    public class EstablishmentOrm : RevisableEntityTypeConfiguration<Establishment>
    {
        public EstablishmentOrm()
        {
            ToTable(typeof(Establishment).Name, DbSchemaName.Establishments);

            // ParentEstablishment 0..1 <---> * ChildEstablishment
            HasOptional(d => d.Parent)
                .WithMany(p => p.Children)
                .Map(d => d.MapKey("ParentId"))
                .WillCascadeOnDelete(false); // do not delete establishment if parent is deleted

            // Establishment * <---> 1 EstablishmentType
            HasRequired(d => d.Type)
                .WithMany()
                .Map(d => d.MapKey("TypeId"))
                .WillCascadeOnDelete(false); // do not delete establishment if type is deleted

            // has many alternate names
            HasMany(p => p.Names)
                .WithRequired(d => d.ForEstablishment)
                .Map(d => d.MapKey("ForEstablishmentId"))
                .WillCascadeOnDelete(true);

            // Establishment 1 <---> * EstablishmentUrl
            HasMany(p => p.Urls)
                .WithRequired(d => d.ForEstablishment)
                .Map(d => d.MapKey("ForEstablishmentId"))
                .WillCascadeOnDelete(true);

            // has many email domains
            HasMany(p => p.EmailDomains)
                .WithRequired(d => d.Establishment)
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(true);

            // has many affiliates
            HasMany(p => p.Affiliates)
                .WithRequired(d => d.Establishment)
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(true);

            // has many ancestors
            HasMany(p => p.Ancestors)
                .WithRequired(d => d.Offspring)
                .HasForeignKey(d => d.OffspringId)
                .WillCascadeOnDelete(false);

            // has many offspring
            HasMany(p => p.Offspring)
                .WithRequired(d => d.Ancestor)
                .HasForeignKey(d => d.AncestorId)
                .WillCascadeOnDelete(false);

            // Establishment 1 <---> 1 EstablishmentLocation
            HasRequired(p => p.Location)
                .WithRequiredPrincipal(d => d.ForEstablishment);

            // Establishment 1 <---> 0..1 EstablishmentSamlSignOn
            HasOptional(p => p.SamlSignOn)
                .WithRequired();

            Property(p => p.OfficialName).IsRequired().HasMaxLength(400);
            Property(p => p.WebsiteUrl).HasMaxLength(200);

            // name complex type properties
            Property(p => p.PublicContactInfo.Phone).HasMaxLength(50).HasColumnName("PublicPhone");
            Property(p => p.PublicContactInfo.Fax).HasMaxLength(50).HasColumnName("PublicFax");
            Property(p => p.PublicContactInfo.Email).HasMaxLength(256).HasColumnName("PublicEmail");

            Property(p => p.PartnerContactInfo.Phone).HasMaxLength(50).HasColumnName("PartnerPhone");
            Property(p => p.PartnerContactInfo.Fax).HasMaxLength(50).HasColumnName("PartnerFax");
            Property(p => p.PartnerContactInfo.Email).HasMaxLength(256).HasColumnName("PartnerEmail");

            Property(p => p.UCosmicCode).IsFixedLength().HasMaxLength(6).IsUnicode(false);
            Property(p => p.CollegeBoardDesignatedIndicator).IsFixedLength().HasMaxLength(6).IsUnicode(false);
        }
    }

    public class EstablishmentLocationOrm : RevisableEntityTypeConfiguration<EstablishmentLocation>
    {
        public EstablishmentLocationOrm()
        {
            ToTable(typeof(EstablishmentLocation).Name, DbSchemaName.Establishments);

            // EstablishmentLocation * <---> * Place
            HasMany(p => p.Places)
                .WithMany()
                .Map(x => x
                    .MapLeftKey("EstablishmentLocationId")
                    .MapRightKey("PlaceId")
                    .ToTable("EstablishmentLocationInPlace", DbSchemaName.Establishments));

            // EstablishmentLocation 1 <---> * EstablishmentAddress
            // EstablishmentLocation 1 <---> 1 NativeAddress
            // EstablishmentLocation 1 <---> 0..1 TranslatedAddress
            HasMany(p => p.Addresses)
                .WithRequired()
                .Map(x => x.MapKey("EstablishmentLocationId"));

            Property(p => p.Center.Latitude).HasColumnName("CenterLatitude");
            Property(p => p.Center.Longitude).HasColumnName("CenterLongitude");
            Property(p => p.BoundingBox.Northeast.Latitude).HasColumnName("BoundingBoxNorthLatitude");
            Property(p => p.BoundingBox.Northeast.Longitude).HasColumnName("BoundingBoxEastLongitude");
            Property(p => p.BoundingBox.Southwest.Latitude).HasColumnName("BoundingBoxSouthLatitude");
            Property(p => p.BoundingBox.Southwest.Longitude).HasColumnName("BoundingBoxWestLongitude");
        }
    }

    public class EstablishmentSamlSignOnOrm : EntityTypeConfiguration<EstablishmentSamlSignOn>
    {
        public EstablishmentSamlSignOnOrm()
        {
            ToTable(typeof(EstablishmentSamlSignOn).Name, DbSchemaName.Establishments);

            Property(p => p.EntityId).IsRequired().HasMaxLength(2048);
            Property(p => p.MetadataUrl).IsRequired().HasMaxLength(2048);
            Property(p => p.MetadataXml).HasColumnType("ntext");
            Property(p => p.SsoLocation).HasMaxLength(2048);
            Property(p => p.SsoBinding).HasMaxLength(50);
        }
    }

    public class EstablishmentAddressOrm : RevisableEntityTypeConfiguration<EstablishmentAddress>
    {
        public EstablishmentAddressOrm()
        {
            ToTable(typeof(EstablishmentAddress).Name, DbSchemaName.Establishments);

            HasRequired(d => d.TranslationToLanguage)
                .WithMany()
                .Map(d => d.MapKey("TranslationToLanguageId"));

            Property(e => e.Text).IsRequired().HasMaxLength(500);
        }
    }

    public class EstablishmentNodeOrm : EntityTypeConfiguration<EstablishmentNode>
    {
        public EstablishmentNodeOrm()
        {
            ToTable(typeof(EstablishmentNode).Name, DbSchemaName.Establishments);

            HasKey(p => new { p.AncestorId, p.OffspringId });
        }
    }

    public class EstablishmentTypeOrm : RevisableEntityTypeConfiguration<EstablishmentType>
    {
        public EstablishmentTypeOrm()
        {
            ToTable(typeof(EstablishmentType).Name, DbSchemaName.Establishments);

            // has one category
            HasRequired(d => d.Category)
                .WithMany()
                .HasForeignKey(d => d.CategoryCode)
                .WillCascadeOnDelete(false); // do not delete type if category is deleted

            Property(p => p.EnglishName).IsRequired().HasMaxLength(150);
            Property(p => p.EnglishPluralName).HasMaxLength(150);
        }
    }

    public class EstablishmentCategoryOrm : EntityTypeConfiguration<EstablishmentCategory>
    {
        public EstablishmentCategoryOrm()
        {
            ToTable(typeof(EstablishmentCategory).Name, DbSchemaName.Establishments);

            HasKey(e => e.Code);

            Property(c => c.EnglishName).IsRequired().HasMaxLength(150);
            Property(c => c.EnglishPluralName).HasMaxLength(150);
            Property(c => c.Code).HasColumnType("char").HasMaxLength(4);
        }
    }

    public class EstablishmentEmailDomainOrm : RevisableEntityTypeConfiguration<EstablishmentEmailDomain>
    {
        public EstablishmentEmailDomainOrm()
        {
            ToTable(typeof(EstablishmentEmailDomain).Name, DbSchemaName.Establishments);

            Property(p => p.Value).IsRequired().HasMaxLength(256);
        }
    }

    public class EstablishmentNameOrm : RevisableEntityTypeConfiguration<EstablishmentName>
    {
        public EstablishmentNameOrm()
        {
            ToTable(typeof(EstablishmentName).Name, DbSchemaName.Establishments);

            HasOptional(d => d.TranslationToLanguage)
                .WithMany()
                .Map(d => d.MapKey("TranslationToLanguageId"));

            Property(p => p.Text).IsRequired().HasMaxLength(EstablishmentNameConstraints.TextMaxLength);
            Property(p => p.AsciiEquivalent).HasMaxLength(EstablishmentNameConstraints.TextMaxLength);
        }
    }

    public class EstablishmentUrlOrm : RevisableEntityTypeConfiguration<EstablishmentUrl>
    {
        public EstablishmentUrlOrm()
        {
            ToTable(typeof(EstablishmentUrl).Name, DbSchemaName.Establishments);

            Property(p => p.Value).IsRequired().HasMaxLength(EstablishmentUrlConstraints.ValueMaxLength);
        }
    }

    public class EmailTemplateOrm : RevisableEntityTypeConfiguration<EmailTemplate>
    {
        public EmailTemplateOrm()
        {
            ToTable(typeof(EmailTemplate).Name, DbSchemaName.Establishments);

            // may have an establishment
            HasOptional(d => d.Establishment)
                .WithMany()
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(true);

            Property(t => t.Name).IsRequired().HasMaxLength(150);
            Property(t => t.SubjectFormat).IsRequired().HasMaxLength(250);
            Property(t => t.FromAddress).HasMaxLength(256);
            Property(t => t.FromDisplayName).HasMaxLength(150);
            Property(t => t.ReplyToAddress).HasMaxLength(256);
            Property(t => t.ReplyToDisplayName).HasMaxLength(150);
            Property(t => t.BodyFormat).IsRequired();
            Property(t => t.Instructions).HasColumnType("ntext");
            Property(t => t.BodyFormat).HasColumnType("ntext");
        }
    }

}
