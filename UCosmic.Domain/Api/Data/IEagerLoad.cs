using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain;

namespace UCosmic
{
    public interface IEagerLoad
    {
        IQueryable<TEntity> EagerLoad<TEntity>(IQueryable<TEntity> query, Expression<Func<TEntity, object>> expression)
            where TEntity : Entity;
    }
}