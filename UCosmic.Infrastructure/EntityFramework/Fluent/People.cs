using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.People;

namespace UCosmic.EntityFramework
{
    public class PersonOrm : RevisableEntityTypeConfiguration<Person>
    {
        public PersonOrm()
        {
            ToTable(typeof(Person).Name, DbSchemaName.People);

            // has zero or one user
            HasOptional(p => p.User)
                .WithRequired(d => d.Person)
                .Map(d => d.MapKey("PersonId"))
                .WillCascadeOnDelete(false)
            ;

            // has zero or one photo
            HasOptional(d => d.Photo)
                .WithOptionalDependent()
                .Map(m => m.MapKey("PhotoId"))
                .WillCascadeOnDelete(false)
            ;

            // has many email addresses
            HasMany(p => p.Emails)
                .WithRequired(d => d.Person)
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(true)
            ;

            // has many messages
            HasMany(p => p.Messages)
                .WithRequired(d => d.ToPerson)
                .HasForeignKey(d => d.ToPersonId)
                .WillCascadeOnDelete(true);

            // has many affiliations
            HasMany(p => p.Affiliations)
                .WithRequired(d => d.Person)
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(true);

            Property(p => p.DisplayName).IsRequired().HasMaxLength(PersonConstraints.DisplayNameMaxLength);
            Property(p => p.Salutation).HasMaxLength(PersonConstraints.SalutationMaxLength);
            Property(p => p.FirstName).HasMaxLength(PersonConstraints.FirstNameMaxLength);
            Property(p => p.MiddleName).HasMaxLength(PersonConstraints.MiddleNameMaxLength);
            Property(p => p.LastName).HasMaxLength(PersonConstraints.LastNameMaxLength);
            Property(p => p.Suffix).HasMaxLength(PersonConstraints.SuffixMaxLength);
            Property(p => p.Gender).HasMaxLength(1).IsFixedLength().IsUnicode(false).IsOptional();
        }
    }

    public class EmailAddressOrm : EntityTypeConfiguration<EmailAddress>
    {
        public EmailAddressOrm()
        {
            ToTable(typeof(EmailAddress).Name, DbSchemaName.People);

            HasKey(p => new { p.PersonId, p.Number });

            // has many confirmations
            HasMany(p => p.Confirmations)
                .WithRequired(d => d.EmailAddress)
                .HasForeignKey(d => new { d.PersonId, d.EmailAddressNumber, })
                .WillCascadeOnDelete(true);

            Property(p => p.Value).IsRequired().HasMaxLength(EmailAddressConstraints.ValueMaxLength);
        }
    }

    public class EmailConfirmationOrm : EntityTypeConfiguration<EmailConfirmation>
    {
        public EmailConfirmationOrm()
        {
            ToTable(typeof(EmailConfirmation).Name, DbSchemaName.People);

            HasKey(p => p.Id);

            Property(p => p.SecretCode).HasMaxLength(15);
            Property(p => p.Ticket).HasMaxLength(256);
            Property(p => p.IntentText).HasColumnName("Intent").IsRequired().HasMaxLength(20);
            Ignore(p => p.Intent);
        }
    }

    public class EmailMessageOrm : EntityTypeConfiguration<EmailMessage>
    {
        public EmailMessageOrm()
        {
            ToTable(typeof(EmailMessage).Name, DbSchemaName.People);

            HasKey(p => new { p.ToPersonId, p.Number });

            Property(m => m.FromEmailTemplate).HasMaxLength(150);
            Property(m => m.ToAddress).IsRequired().HasMaxLength(256);
            Property(m => m.Subject).IsRequired().HasMaxLength(250);
            Property(m => m.FromAddress).IsRequired().HasMaxLength(256);
            Property(m => m.FromDisplayName).HasMaxLength(150);
            Property(m => m.ReplyToAddress).HasMaxLength(256);
            Property(m => m.ReplyToDisplayName).HasMaxLength(150);
            Property(m => m.Body).IsRequired().HasColumnType("ntext");
            Property(m => m.ComposedByPrincipal).HasMaxLength(256);
        }
    }

    public class ExternalUrlOrm : EntityTypeConfiguration<ExternalUrl>
    {
        public ExternalUrlOrm()
        {
            ToTable(typeof(ExternalUrl).Name, DbSchemaName.People);

            HasRequired(d => d.Person)
                .WithMany(p => p.Urls)
                .HasForeignKey(d => d.PersonId);

            Property(x => x.Description).HasMaxLength(ExternalUrl.Constraints.DescriptionMaxLength);
            Property(x => x.Value).HasMaxLength(ExternalUrl.Constraints.ValueMaxLength);
        }
    }

    public class AffiliationOrm : RevisableEntityTypeConfiguration<Affiliation>
    {
        public AffiliationOrm()
        {
            ToTable(typeof(Affiliation).Name, DbSchemaName.People);

            HasRequired(d => d.Establishment)
                .WithMany()
                .HasForeignKey(d => d.EstablishmentId);

            HasRequired(d => d.Person)
                .WithMany(p => p.Affiliations)
                .HasForeignKey(d => d.PersonId);

            HasOptional(d => d.FacultyRank)
                .WithMany()
                .HasForeignKey(d => d.FacultyRankId);

            Property(p => p.JobTitles).HasMaxLength(AffiliationConstraints.JobTitlesMaxLength);
        }
    }
}
