using System;

namespace UCosmic
{
    internal static class ReflectionExtensions
    {
        internal static bool IsGenericallyAssignableFrom(this Type g, Type c)
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
    }
}