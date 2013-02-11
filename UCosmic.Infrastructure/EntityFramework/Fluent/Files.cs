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
}
