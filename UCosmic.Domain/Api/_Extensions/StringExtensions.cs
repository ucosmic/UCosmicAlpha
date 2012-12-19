using System;
using System.Linq;

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

        public static string GetEmailDomain(this string email)
        {
            if (email == null) throw new ArgumentNullException("email");

            const char at = '@';
            if (!email.Contains(at))
                throw new InvalidOperationException(string.Format(
                    "The string '{0}' is missing its '{1}' character.", email, at));
            if (email.IndexOf(at) != email.LastIndexOf(at))
                throw new InvalidOperationException(string.Format(
                    "The string '{0}' has more than one '{1}' characters.", email, at));

            return email.Substring(email.LastIndexOf(at));
        }
    }
}
