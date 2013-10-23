using System;
using System.Text;

namespace UCosmic.Domain.Agreements
{
    internal static class AgreementDataMigrationExtensions
    {
        internal static string ToHtml(this string originalText)
        {
            if (string.IsNullOrWhiteSpace(originalText)) return null;
            // replace entities first
            var html = new StringBuilder();
            var text = originalText.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
            var paragraphs = text.Split(new[] {'\n'}, StringSplitOptions.RemoveEmptyEntries);

            foreach (var paragraph in paragraphs)
            {
                html.AppendLine(string.Format("<p>{0}</p>", paragraph.MakeLinks()));
            }

            return html.ToString();
        }

        private static string MakeLinks(this string text)
        {
            var words = text.Split(new[] {' '});
            var builder = new StringBuilder();
            foreach (var word in words)
            {
                if (word.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    word.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    var url = word;
                    // strip off trailing slash
                    while (url.EndsWith("/"))
                    {
                        url = url.Substring(0, url.LastIndexOf("/", StringComparison.Ordinal));
                    }
                    // wrap in hyperlink
                    var content = url.Substring(7);
                    while (content.StartsWith("/"))
                    {
                        content = text.Substring(1);
                    }
                    var link = string.Format("<a href=\"{0}\" target=\"_blank\">{1}</a>", url, content);
                    builder.AppendFormat("{0} ", link);
                }
                else
                {
                    builder.AppendFormat("{0} ", word);
                }
            }
            return builder.ToString().Trim();
        }
    }
}
