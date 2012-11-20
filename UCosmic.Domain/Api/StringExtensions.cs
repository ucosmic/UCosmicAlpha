using System;

namespace UCosmic
{
    public static class StringExtensions
    {
        public static bool Contains(this string container, string value, StringComparison comparison)
        {
            return container.IndexOf(value, comparison) >= 0;
        }

        public static string WithoutTrailingSlash(this string input)
        {
            if (input != null && (input.EndsWith("/") || input.EndsWith("\\")))
                return input.Substring(0, input.Length - 1);
            return input;
        }
    }
}
