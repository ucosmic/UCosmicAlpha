using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Languages;

namespace UCosmic.EntityFramework
{
    public class LanguageOrm : EntityTypeConfiguration<Language>
    {
        public LanguageOrm()
        {
            ToTable(typeof(Language).Name, DbSchemaName.Languages);
            HasKey(e => e.Id);

            Property(p => p.TwoLetterIsoCode).IsRequired().IsFixedLength().HasMaxLength(2);
            Property(p => p.ThreeLetterIsoCode).IsRequired().IsFixedLength().HasMaxLength(3);
            Property(p => p.ThreeLetterIsoBibliographicCode).IsRequired().IsFixedLength().HasMaxLength(3);

            Property(p => p.TwoLetterIsoCode).IsUnicode(false);
            Property(p => p.ThreeLetterIsoCode).IsUnicode(false);
            Property(p => p.ThreeLetterIsoBibliographicCode).IsUnicode(false);

            // Language (1) <-----> (0..*) LanguageName
            HasMany(p => p.Names)
                .WithRequired(d => d.Owner)
                .HasForeignKey(d => d.LanguageId)
                .WillCascadeOnDelete(true)
            ;
        }
    }

    public class LanguageNameOrm : EntityTypeConfiguration<LanguageName>
    {
        public LanguageNameOrm()
        {
            ToTable(typeof(LanguageName).Name, DbSchemaName.Languages);
            HasKey(x => new { x.LanguageId, x.Number });

            Property(p => p.Text).IsRequired().HasMaxLength(150);
            Property(p => p.AsciiEquivalent).IsRequired().IsUnicode(false).HasMaxLength(150);

            // LanguageName (0..*) <-----> (1) Language (name is a translation to a different language)
            HasRequired(d => d.TranslationToLanguage)
                .WithMany()
                .HasForeignKey(d => d.TranslationToLanguageId)
                .WillCascadeOnDelete(false)
            ;
        }
    }
}
