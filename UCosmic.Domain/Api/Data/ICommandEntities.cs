using System.Linq;
using UCosmic.Domain;

namespace UCosmic
{
    public interface ICommandEntities : IQueryEntities, IUnitOfWork
    {
        TEntity FindByPrimaryKey<TEntity>(params object[] primaryKeyValues)
            where TEntity : Entity;
        IQueryable<TEntity> Get<TEntity>() where TEntity : Entity;
        void Create<TEntity>(TEntity entity) where TEntity : Entity;
        void Update<TEntity>(TEntity entity) where TEntity : Entity;
        void Purge<TEntity>(TEntity entity) where TEntity : Entity;
        void Reload<TEntity>(TEntity entity) where TEntity : Entity;
    }
}
