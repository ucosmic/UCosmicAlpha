using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Audit;

namespace UCosmic.EntityFramework
{
    public class DeletionOrm : EntityTypeConfiguration<Deletion>
    {
        public DeletionOrm()
        {
            ToTable(typeof(Deletion).Name, "Audit");

            Property(x => x.PreviousState).HasColumnType("ntext");
        }
    }
}
