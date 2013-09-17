using System;

namespace UCosmic
{
    internal static class ViewManagementExtensions
    {
        internal static string GetViewKey(this Type type)
        {
            return string.Format("view:{0}.{1}", type.Namespace, type.Name);
        }
    }
}
