using UCosmic.Domain.LanguageExpertises;

namespace UCosmic.EntityFramework
{
    public class LanguageExpertiseOrm : RevisableEntityTypeConfiguration<LanguageExpertise>
    {
        public LanguageExpertiseOrm()
        {
            ToTable(typeof(LanguageExpertise).Name, DbSchemaName.Employees);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasRequired(p => p.Language)
                .WithMany()
                .HasForeignKey(d => d.LanguageId)
                .WillCascadeOnDelete(false);

            Property(p => p.Dialect).IsOptional().HasMaxLength(200);
            Property(p => p.Other).IsOptional().HasMaxLength(200);
            Property(p => p.SpeakingProficiency).IsRequired();
            Property(p => p.ListeningProficiency).IsRequired();
            Property(p => p.ReadingProficiency).IsRequired();
            Property(p => p.WritingProficiency).IsRequired();
        }
    }
}