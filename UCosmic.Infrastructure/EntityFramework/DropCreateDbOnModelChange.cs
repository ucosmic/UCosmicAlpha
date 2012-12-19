using System.Data.Entity;

namespace UCosmic.EntityFramework
{
    public class DropCreateDbOnModelChange : DropCreateDatabaseIfModelChanges<UCosmicContext>
    {
        private readonly IOptimizeDatabase _optimizer;

        public DropCreateDbOnModelChange(IOptimizeDatabase optimizer)
        {
            _optimizer = optimizer;
        }

        protected override void Seed(UCosmicContext context)
        {
            if (_optimizer != null) _optimizer.Optimize(context);
        }
    }
}
