using System;

namespace UCosmic
{
    public static class StringExtensions
    {
        public static bool Contains(this string container, string value, StringComparison comparison)
        {
            return container.IndexOf(value, comparison) >= 0;
        }
    }
}
