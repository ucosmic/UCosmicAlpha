using System.Data.Entity;

namespace UCosmic.EntityFramework
{
    public class DropCreateDbOnEveryBuild : DropCreateDatabaseAlways<UCosmicContext>
    {
        private readonly IOptimizeDatabase _optimizer;

        public DropCreateDbOnEveryBuild(IOptimizeDatabase optimizer)
        {
            _optimizer = optimizer;
        }

        protected override void Seed(UCosmicContext context)
        {
            if (_optimizer != null) _optimizer.Optimize(context);
        }
    }
}
