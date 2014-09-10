using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Home
{
    internal static class QueryHomeSection
    {

        internal static HomeSection ById(this IQueryable<HomeSection> queryable, Int32 id, bool allowNull = true)
        {
            return allowNull
                ? queryable.SingleOrDefault(ById(id))
                : queryable.Single(ById(id));
        }
        private static Expression<Func<HomeSection, bool>> ById(Int32 id)
        {
            return x => x.Id != null && x.Id == id;
        }
        

    }
}
