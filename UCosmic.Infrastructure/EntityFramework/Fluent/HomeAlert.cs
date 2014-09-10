using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.Home;

namespace UCosmic.EntityFramework
{
    public class HomeAlertOrm : EntityTypeConfiguration<HomeAlert>
    {
        public HomeAlertOrm()
        {
            ToTable(typeof(HomeAlert).Name, DbSchemaName.HomeAlert);

            // has one establishment
            HasOptional(d => d.Establishment)
                .WithMany()
                .HasForeignKey(d => d.EstablishmentId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired();
        }
    }
    
}
