using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

        public static string WithoutEnclosingDoubleQuotes(this string input)
        {
            const string doubleQuote = "\"";
            if (input.StartsWith(doubleQuote))
                input = input.Substring(1);
            if (input.EndsWith(doubleQuote))
                input = input.Substring(0, input.Length - 1);
            return input;
        }

        public static byte[] ToHexBytes(this string hex)
        {
            if (string.IsNullOrWhiteSpace(hex)) return null;

            var charCount = hex.Length;
            var bytes = new byte[charCount / 2];
            for (var i = 0; i < charCount; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }
            return bytes;
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

        public static string GetUrlDomain(this string url)
        {
            if (url == null) throw new ArgumentNullException("url");

            if (url.StartsWith("www."))
                url = url.Substring(4);
            return url;
        }

        public static string FormatTemplate(this string template, IEnumerable<KeyValuePair<string, string>> replacements)
        {
            if (string.IsNullOrWhiteSpace(template))
                return template;

            var content = new StringBuilder(template);
            if (replacements != null)
            {
                foreach (var replacement in replacements)
                {
                    content.Replace(replacement.Key, replacement.Value);
                }
            }

            return content.ToString();
        }

        public static IEnumerable<string> Explode(this string imploded, string delimiter)
        {
            if (imploded != null)
            {
                var exploded = new List<string>();
                if (imploded.Contains(delimiter))
                {
                    var split = imploded.Split(new[] { delimiter }, StringSplitOptions.RemoveEmptyEntries);
                    exploded.AddRange(split);
                }
                else
                {
                    exploded.Add(imploded);
                }
                return exploded.ToArray();
            }
            return null;
        }

        //public static string Implode(this IEnumerable<string> exploded, string delimiter)
        //{
        //    if (delimiter == null) throw new ArgumentNullException("delimiter");
        //    if (exploded != null)
        //    {
        //        var explodedArray = exploded as string[] ?? exploded.ToArray();
        //        if (explodedArray.Any())
        //        {
        //            var imploded = new StringBuilder();
        //            foreach (var value in explodedArray)
        //            {
        //                imploded.Append(value);
        //                imploded.Append(delimiter);
        //            }
        //            imploded.Remove(imploded.Length - delimiter.Length, delimiter.Length);
        //            return imploded.ToString();
        //        }
        //    }
        //    return null;
        //}

        public static int? GetLastInt(this string value, char separator = '/')
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            var parts = value.Split(new[] { separator }, StringSplitOptions.RemoveEmptyEntries);
            int asInt;
            foreach (var part in parts)
                if (int.TryParse(part, out asInt))
                    return asInt;

            return null;
        }
    }
}
