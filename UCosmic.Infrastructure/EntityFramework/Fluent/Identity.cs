using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Identity;

namespace UCosmic.EntityFramework
{
    public class UserOrm : RevisableEntityTypeConfiguration<User>
    {
        public UserOrm()
        {
            ToTable(typeof(User).Name, DbSchemaName.Identity);

            Property(u => u.Name).IsRequired().HasMaxLength(256);
            Property(u => u.EduPersonTargetedId).IsMaxLength();
        }
    }

    public class RoleOrm : RevisableEntityTypeConfiguration<Role>
    {
        public RoleOrm()
        {
            ToTable(typeof(Role).Name, DbSchemaName.Identity);

            Property(p => p.Name).IsRequired().HasMaxLength(200);
            Property(p => p.Description).IsMaxLength();
        }
    }

    public class RoleGrantOrm : RevisableEntityTypeConfiguration<RoleGrant>
    {
        public RoleGrantOrm()
        {
            ToTable(typeof(RoleGrant).Name, DbSchemaName.Identity);

            // has one user
            HasRequired(d => d.User)
                .WithMany(p => p.Grants)
                .Map(d => d.MapKey("UserId"))
                .WillCascadeOnDelete(true);

            // has one role
            HasRequired(d => d.Role)
                .WithMany(p => p.Grants)
                .Map(d => d.MapKey("RoleId"))
                .WillCascadeOnDelete(true);

            // may have an establishment
            HasOptional(d => d.ForEstablishment)
                .WithMany()
                .Map(d => d.MapKey("ForEstablishmentId"))
                .WillCascadeOnDelete(true);
        }
    }

    public class PreferenceOrm : EntityTypeConfiguration<Preference>
    {
        public PreferenceOrm()
        {
            ToTable(typeof(Preference).Name, DbSchemaName.Identity);

            HasKey(p => new { p.Owner, p.Category, p.Key });

            Property(p => p.Owner).IsRequired().HasMaxLength(100);
            Property(p => p.AnonymousId).HasMaxLength(100);
            Property(p => p.Category).IsRequired().HasMaxLength(100);
            Property(p => p.Key).IsRequired().HasMaxLength(100);

            // has one user
            HasOptional(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .WillCascadeOnDelete(true);
        }
    }

    public class SubjectNameIdentifierOrm : EntityTypeConfiguration<SubjectNameIdentifier>
    {
        public SubjectNameIdentifierOrm()
        {
            ToTable(typeof(SubjectNameIdentifier).Name, DbSchemaName.Identity);

            HasKey(p => new { p.UserId, p.Number });

            // has one user
            HasRequired(d => d.User)
                .WithMany(p => p.SubjectNameIdentifiers)
                .HasForeignKey(d => d.UserId)
                .WillCascadeOnDelete(true);

            Property(p => p.Value).IsRequired().HasMaxLength(256);
        }
    }

    public class EduPersonScopedAffiliationOrm : EntityTypeConfiguration<EduPersonScopedAffiliation>
    {
        public EduPersonScopedAffiliationOrm()
        {
            ToTable(typeof(EduPersonScopedAffiliation).Name, DbSchemaName.Identity);

            HasKey(p => new { p.UserId, p.Number });

            // has one user
            HasRequired(d => d.User)
                .WithMany(p => p.EduPersonScopedAffiliations)
                .HasForeignKey(d => d.UserId)
                .WillCascadeOnDelete(true);

            Property(p => p.Value).IsRequired().HasMaxLength(256);
        }
    }
}
