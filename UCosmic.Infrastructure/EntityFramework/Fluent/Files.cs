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
}
