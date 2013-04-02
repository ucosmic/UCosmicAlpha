using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Files;

namespace UCosmic.EntityFramework
{
    public class LooseFileOrm : RevisableEntityTypeConfiguration<LooseFile>
    {
        public LooseFileOrm()
        {
            ToTable(typeof(LooseFile).Name, DbSchemaName.Files);
        }
    }

    public class LoadableFileOrm : EntityTypeConfiguration<LoadableFile>
    {
        public LoadableFileOrm()
        {
            ToTable(typeof(LoadableFile).Name, DbSchemaName.Files);

            HasRequired(p => p.Binary)
                .WithRequiredPrincipal(d => d.Owner)
                .WillCascadeOnDelete(true)
            ;
        }
    }

    public class LoadableFileBinaryOrm : EntityTypeConfiguration<LoadableFileBinary>
    {
        public LoadableFileBinaryOrm()
        {
            ToTable(typeof(LoadableFileBinary).Name, DbSchemaName.Files);

            HasRequired(d => d.Owner)
                .WithRequiredDependent(p => p.Binary)
                .WillCascadeOnDelete(true)
            ;
        }
    }

    public class ImageOrm : EntityTypeConfiguration<Image>
    {
        public ImageOrm()
        {
            ToTable(typeof(Image).Name, DbSchemaName.Files);

            Property(p => p.Title).IsOptional().HasMaxLength(64);
            Property(p => p.MimeType).IsRequired().HasMaxLength(256);
        }
    }

    public class ProxyImageMimeTypeXRefOrm : EntityTypeConfiguration<ProxyImageMimeTypeXRef>
    {
        public ProxyImageMimeTypeXRefOrm()
        {
            ToTable(typeof(ProxyImageMimeTypeXRef).Name, DbSchemaName.Files);
        }
    }

}
