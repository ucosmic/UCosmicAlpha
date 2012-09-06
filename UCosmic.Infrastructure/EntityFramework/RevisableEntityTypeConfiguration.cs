using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain;

namespace UCosmic.EntityFramework
{
    public abstract class RevisableEntityTypeConfiguration<TRevisableEntity>
        : EntityTypeConfiguration<TRevisableEntity> where TRevisableEntity : RevisableEntity
    {
        public RevisableEntityTypeConfiguration()
        {
            HasKey(k => k.RevisionId);
            Property(p => p.EntityId).IsRequired();
            Property(p => p.CreatedOnUtc).IsRequired();
            Property(p => p.CreatedByPrincipal).HasMaxLength(256);
            Property(p => p.UpdatedByPrincipal).HasMaxLength(256);
            Property(p => p.Version).IsConcurrencyToken(true).IsRowVersion();
        }
    }
}
