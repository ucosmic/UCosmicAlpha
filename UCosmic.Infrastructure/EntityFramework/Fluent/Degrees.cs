using UCosmic.Domain.Degrees;

namespace UCosmic.EntityFramework
{
    public class DegreeOrm : RevisableEntityTypeConfiguration<Degree>
    {
        public DegreeOrm()
        {
            ToTable(typeof (Degree).Name, DbSchemaName.Employees);

            HasRequired(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.PersonId)
                .WillCascadeOnDelete(false);

            HasOptional(d => d.Institution)
                .WithMany()
                .HasForeignKey(d => d.InstitutionId)
                .WillCascadeOnDelete(false);

            Property(p => p.Title).HasColumnName("Title").IsRequired().HasMaxLength(DegreeConstraints.TitleMaxLength);
            Property(p => p.FieldOfStudy).HasColumnName("FieldOfStudy").IsOptional().HasMaxLength(DegreeConstraints.FieldOfStudyMaxLength);
            Property(p => p.YearAwarded).HasColumnName("YearAwarded").IsOptional();
        }
    }
}