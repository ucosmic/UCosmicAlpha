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

            // might have FacultyRank assigned
            HasOptional(p => p.FacultyRank);

            Property(p => p.DisplayName).IsRequired().HasMaxLength(200);
            Property(p => p.Salutation).HasMaxLength(50);
            Property(p => p.FirstName).HasMaxLength(100);
            Property(p => p.MiddleName).HasMaxLength(100);
            Property(p => p.LastName).HasMaxLength(100);
            Property(p => p.Suffix).HasMaxLength(50);
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

            Property(p => p.Value).IsRequired().HasMaxLength(256);
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

    public class AffiliationOrm : EntityTypeConfiguration<Affiliation>
    {
        public AffiliationOrm()
        {
            ToTable(typeof(Affiliation).Name, DbSchemaName.People);

            HasKey(p => new { p.PersonId, p.EstablishmentId });

            Property(p => p.JobTitles).HasMaxLength(500);
        }
    }
}
