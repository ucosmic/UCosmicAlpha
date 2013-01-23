using System.Linq;
using UCosmic.Domain;

namespace UCosmic
{
    public interface IQueryEntities : IEagerLoad
    {
        IQueryable<TEntity> Query<TEntity>() where TEntity : Entity;
    }
}
