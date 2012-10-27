using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Audit;

namespace UCosmic.EntityFramework
{
    public class CommandEventOrm : EntityTypeConfiguration<CommandEvent>
    {
        public CommandEventOrm()
        {
            ToTable(typeof(CommandEvent).Name, "Audit");

            Property(x => x.Name).IsRequired();
            Property(x => x.Value).IsRequired();
            Property(x => x.NewState).HasColumnType("ntext");
            Property(x => x.PreviousState).HasColumnType("ntext");
        }
    }
}
