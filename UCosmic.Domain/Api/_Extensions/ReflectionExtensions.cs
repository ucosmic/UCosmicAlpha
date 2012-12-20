using System;
using System.Linq.Expressions;

namespace UCosmic
{
    public static class ReflectionExtensions
    {
        public static bool IsGenericallyAssignableFrom(this Type g, Type c)
        {
            var interfaceTypes = c.GetInterfaces();

            foreach (var it in interfaceTypes)
                if (it.IsGenericType)
                    if (it.GetGenericTypeDefinition() == g) return true;

            var baseType = c.BaseType;
            if (baseType == null) return false;

            return baseType.IsGenericType &&
                   baseType.GetGenericTypeDefinition() == g ||
                   g.IsGenericallyAssignableFrom(baseType);
        }

        public static string PropertyName<T>(this T owner, Expression<Func<T, object>> expression) where T : class
        {
            if (owner == null) throw new ArgumentNullException("owner");
            var memberExpression = (MemberExpression)expression.Body;
            return memberExpression.Member.Name;
        }

        public static T PropertyValue<T>(this object owner, string propertyName)
        {
            return (T)owner.GetType().GetProperty(propertyName).GetValue(owner, null);
        }
    }
}
