using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Images;

namespace UCosmic.EntityFramework
{
    public class ImageOrm : EntityTypeConfiguration<Image>
    {
        public ImageOrm()
        {
            ToTable(typeof(Image).Name, DbSchemaName.Files);
        }
    }

}
