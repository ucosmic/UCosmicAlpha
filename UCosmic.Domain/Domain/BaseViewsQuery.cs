using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace UCosmic.Domain
{
    public abstract class BaseViewsQuery<TView>
    {
        public IDictionary<Expression<Func<TView, object>>, OrderByDirection> OrderBy { get; set; }
    }
}
