using System;
using System.Linq.Expressions;

namespace UCosmic
{
    public static class ReflectionExtensions
    {
        public static string PropertyName<T>(this T owner, Expression<Func<T, object>> expression) where T : class
        {
            if (owner == null) throw new ArgumentNullException("owner");
            var memberExpression = (MemberExpression)expression.Body;
            return memberExpression.Member.Name;
        }
    }
}
