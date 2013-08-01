using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Agreements;

namespace UCosmic.EntityFramework
{
    public class AgreementSettingsOrm : RevisableEntityTypeConfiguration<AgreementSettings>
    {
        public AgreementSettingsOrm()
        {
            ToTable(typeof(AgreementSettings).Name, DbSchemaName.Agreements);

            // has one establishment
            HasOptional(d => d.ForEstablishment)
                .WithMany()
                .HasForeignKey(d => d.ForEstablishmentId)
                .WillCascadeOnDelete();
        }
    }

    public class AgreementSettingsTypeValueOrm : EntityTypeConfiguration<AgreementSettingsTypeValue>
    {
        public AgreementSettingsTypeValueOrm()
        {
            ToTable(typeof(AgreementSettingsTypeValue).Name, DbSchemaName.Agreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Settings)
                .WithMany(p => p.AllowedTypeValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(AgreementConstraints.TypeMaxLength);
        }
    }

    public class AgreementSettingsStatusValueOrm : EntityTypeConfiguration<AgreementSettingsStatusValue>
    {
        public AgreementSettingsStatusValueOrm()
        {
            ToTable(typeof(AgreementSettingsStatusValue).Name, DbSchemaName.Agreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Settings)
                .WithMany(p => p.AllowedStatusValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(AgreementConstraints.StatusMaxLength);
        }
    }

    public class AgreementSettingsContactTypeValueOrm : EntityTypeConfiguration<AgreementSettingsContactTypeValue>
    {
        public AgreementSettingsContactTypeValueOrm()
        {
            ToTable(typeof(AgreementSettingsContactTypeValue).Name, DbSchemaName.Agreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Settings)
                .WithMany(p => p.AllowedContactTypeValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(AgreementContactConstraints.ContactTypeMaxLength);
        }
    }

    public class AgreementOrm : EntityTypeConfiguration<Agreement>
    {
        public AgreementOrm()
        {
            ToTable(typeof(Agreement).Name, DbSchemaName.Agreements);

            HasKey(x => x.Id);
            Property(p => p.Guid).IsRequired();
            Property(p => p.CreatedOnUtc).IsRequired();
            Property(p => p.CreatedByPrincipal).HasMaxLength(256);
            Property(p => p.UpdatedByPrincipal).HasMaxLength(256);
            Property(p => p.Version).IsConcurrencyToken(true).IsRowVersion();

            // offspring is no longer derived from children
            //Ignore(p => p.Offspring);

            // has 0 or 1 umbrella
            HasOptional(d => d.Umbrella)
                .WithMany(p => p.Children)
                .HasForeignKey(d => d.UmbrellaId)
                .WillCascadeOnDelete(false);

            // has many participants
            HasMany(p => p.Participants)
                .WithRequired(d => d.Agreement)
                .HasForeignKey(d => d.AgreementId)
                .WillCascadeOnDelete(true);

            // has many contacts
            HasMany(p => p.Contacts)
                .WithRequired(d => d.Agreement)
                .HasForeignKey(d => d.AgreementId)
                .WillCascadeOnDelete(true);

            // has many files
            HasMany(p => p.Files)
                .WithRequired(d => d.Agreement)
                .HasForeignKey(d => d.AgreementId)
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

            Property(p => p.Title).IsRequired().HasMaxLength(AgreementConstraints.TitleMaxLength);
            Property(p => p.Name).HasMaxLength(AgreementConstraints.NameMaxLength);
            Property(p => p.Description).IsMaxLength();
            Property(p => p.Content).HasColumnType("ntext");
            Property(p => p.Notes).IsMaxLength();
            Property(p => p.Type).IsRequired().HasMaxLength(AgreementConstraints.TypeMaxLength);
            Property(p => p.Status).IsRequired().HasMaxLength(AgreementConstraints.StatusMaxLength);
            Property(p => p.StartsOn);
            Property(p => p.ExpiresOn);
            Property(p => p.VisibilityText).HasColumnName("Visibility").IsRequired().HasMaxLength(10);
        }
    }

    public class AgreementNodeOrm : EntityTypeConfiguration<AgreementNode>
    {
        public AgreementNodeOrm()
        {
            ToTable(typeof(AgreementNode).Name, DbSchemaName.Agreements);

            HasKey(p => new { p.AncestorId, p.OffspringId });
        }
    }

    public class AgreementParticipantOrm : EntityTypeConfiguration<AgreementParticipant>
    {
        public AgreementParticipantOrm()
        {
            ToTable(typeof(AgreementParticipant).Name, DbSchemaName.Agreements);

            HasKey(k => k.Id);

            // has one establishment
            HasRequired(d => d.Establishment)
                .WithMany()
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete(false); // do not delete agreements when deleting establishment
        }
    }

    public class AgreementContactOrm : EntityTypeConfiguration<AgreementContact>
    {
        public AgreementContactOrm()
        {
            ToTable(typeof(AgreementContact).Name, DbSchemaName.Agreements);

            HasKey(x => x.Id);
            Property(p => p.Guid).IsRequired();
            Property(p => p.CreatedOnUtc).IsRequired();
            Property(p => p.CreatedByPrincipal).HasMaxLength(256);
            Property(p => p.UpdatedByPrincipal).HasMaxLength(256);
            Property(p => p.Version).IsConcurrencyToken(true).IsRowVersion();

            // has one person
            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(true);

            // has zero or 1 affiliation
            HasOptional(d => d.ParticipantAffiliation)
                .WithMany()
                .HasForeignKey(d => d.ParticipantAffiliationId)
                .WillCascadeOnDelete(true);

            // has zero or many phones
            HasMany(p => p.PhoneNumbers)
                .WithRequired(d => d.Owner)
                .WillCascadeOnDelete(true);

            Property(p => p.Type).IsRequired().HasMaxLength(AgreementContactConstraints.ContactTypeMaxLength);
            Property(p => p.Title).IsOptional().HasMaxLength(AgreementContactConstraints.TitleMaxLength);
        }
    }


    public class AgreementContactPhoneOrm : EntityTypeConfiguration<AgreementContactPhone>
    {
        public AgreementContactPhoneOrm()
        {
            ToTable(typeof(AgreementContactPhone).Name, DbSchemaName.Agreements);

            HasKey(p => p.Id);

            // has one person
            HasRequired(d => d.Owner)
                .WithMany(p => p.PhoneNumbers)
                .HasForeignKey(d => d.OwnerId)
                .WillCascadeOnDelete(true);

            Property(p => p.Type).IsOptional().HasMaxLength(AgreementContactPhoneConstraints.TypeMaxLength);
            Property(p => p.Value).IsRequired().HasMaxLength(AgreementContactPhoneConstraints.ValueMaxLength);
        }
    }

    public class AgreementFileOrm : EntityTypeConfiguration<AgreementFile>
    {
        public AgreementFileOrm()
        {
            ToTable(typeof(AgreementFile).Name, DbSchemaName.Agreements);
            HasKey(m => m.Id);
            Property(p => p.Guid).IsRequired();
            Property(p => p.CreatedOnUtc).IsRequired();
            Property(p => p.CreatedByPrincipal).HasMaxLength(256);
            Property(p => p.UpdatedByPrincipal).HasMaxLength(256);
            Property(p => p.Version).IsConcurrencyToken(true).IsRowVersion();

            Property(x => x.FileName).HasMaxLength(AgreementFileConstraints.FileNameMaxLength);
            Property(x => x.Name).HasMaxLength(AgreementFileConstraints.NameMaxLength);
            Property(x => x.VisibilityText).HasColumnName("Visibility")
                //.IsRequired()
                .HasMaxLength(20);
        }
    }
}
