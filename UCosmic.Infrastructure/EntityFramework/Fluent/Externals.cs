using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.External;

namespace UCosmic.EntityFramework
{
    public class ServiceSyncOrm : EntityTypeConfiguration<ServiceSync>
    {
        public ServiceSyncOrm()
        {
            ToTable(typeof(ServiceSync).Name, DbSchemaName.External);

            Property(p => p.RowVersion).IsRowVersion();
            Property(p => p.Id).IsRequired();
            Property(p => p.Name).IsOptional().HasMaxLength(32).IsUnicode(false);
            Property(p => p.ExternalSyncDate).IsOptional();
            Property(p => p.LastUpdateAttempt).IsOptional();
            Property(p => p.UpdateFailCount).IsOptional();
            Property(p => p.LastUpdateResult).HasMaxLength(16).IsUnicode(false);
            Property(p => p.ServiceUsername).HasMaxLength(128);
            Property(p => p.ServicePassword).HasMaxLength(128);
        }
    }
}