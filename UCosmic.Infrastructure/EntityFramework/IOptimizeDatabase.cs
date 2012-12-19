using System.Data.Entity;

namespace UCosmic.EntityFramework
{
    public interface IOptimizeDatabase
    {
        void Optimize(DbContext context);
    }
}