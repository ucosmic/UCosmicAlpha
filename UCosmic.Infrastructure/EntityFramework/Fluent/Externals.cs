using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.External;

namespace UCosmic.EntityFramework
{
    public class ServiceManifestOrm : EntityTypeConfiguration<ServiceManifest>
    {
        public ServiceManifestOrm()
        {
            ToTable(typeof(ServiceManifest).Name, DbSchemaName.External);

            HasKey(x => x.TenantId);

            HasRequired(d => d.Tenant)
                .WithOptional()
                .WillCascadeOnDelete(false)
            ;
        }
    }

    public class ServiceIntegrationOrm : EntityTypeConfiguration<ServiceIntegration>
    {
        public ServiceIntegrationOrm()
        {
            ToTable(typeof(ServiceIntegration).Name, DbSchemaName.External);

            HasKey(x => new { x.TenantId, x.Name });
            Property(x => x.Name).HasColumnType("varchar").HasMaxLength(50);

            HasRequired(d => d.Manifest)
                .WithMany(p => p.Integrations)
                .HasForeignKey(d => d.TenantId)
                .WillCascadeOnDelete(false)
            ;

        }
    }

    public class ServiceStringAttributeOrm : EntityTypeConfiguration<ServiceStringAttribute>
    {
        public ServiceStringAttributeOrm()
        {
            ToTable(typeof(ServiceStringAttribute).Name, DbSchemaName.External);

            HasKey(x => new { x.TenantId, x.IntegrationName, x.Name });
            Property(x => x.Name).HasColumnType("varchar").HasMaxLength(50);
            Property(x => x.Value).HasMaxLength(1000);

            HasRequired(d => d.Integration)
                .WithMany(p => p.StringAttributes)
                .HasForeignKey(d => new { d.TenantId, d.IntegrationName })
                .WillCascadeOnDelete(false)
            ;

        }
    }

    public class ServiceLogEntryOrm : EntityTypeConfiguration<ServiceLogEntry>
    {
        public ServiceLogEntryOrm()
        {
            ToTable(typeof(ServiceLogEntry).Name, DbSchemaName.External);

            HasKey(x => new { x.TenantId, x.IntegrationName, x.EntityId });
            Property(x => x.Subject).HasMaxLength(100);
            Property(x => x.Log).HasColumnType("ntext");

            HasRequired(d => d.Integration)
                .WithMany(p => p.LogEntries)
                .HasForeignKey(d => new { d.TenantId, d.IntegrationName })
                .WillCascadeOnDelete(false)
            ;

        }
    }
}