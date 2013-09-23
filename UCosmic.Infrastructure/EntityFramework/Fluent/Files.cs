using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Files;

namespace UCosmic.EntityFramework
{
    public class UploadOrm : EntityTypeConfiguration<Upload>
    {
        public UploadOrm()
        {
            ToTable(typeof(Upload).Name, DbSchemaName.Files);
            HasKey(x => x.Guid);
        }
    }

    public class ExternalFileOrm : EntityTypeConfiguration<ExternalFile>
    {
        public ExternalFileOrm()
        {
            ToTable(typeof(ExternalFile).Name, DbSchemaName.Files);

            Property(p => p.MimeType).IsRequired().HasMaxLength(256);
        }
    }
}
