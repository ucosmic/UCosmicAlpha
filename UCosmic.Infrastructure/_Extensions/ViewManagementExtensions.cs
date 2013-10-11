using System;
using System.Text;

namespace UCosmic
{
    internal static class ViewManagementExtensions
    {
        internal static string GetViewKey(this Type type, params object[] parameters)
        {
            var key = new StringBuilder(string.Format("view:{0}.{1}", type.Namespace, type.Name));
            if (parameters != null && parameters.Length > 0)
            {
                foreach (var parameter in parameters)
                {
                    key.Append(string.Format(":{0}", parameter ?? ""));
                }
            }
            return key.ToString();
        }
    }
}
