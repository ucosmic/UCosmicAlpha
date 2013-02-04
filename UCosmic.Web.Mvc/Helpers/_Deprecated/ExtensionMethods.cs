using System.Collections.Generic;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class ExtensionMethods
    {
        public static MvcHtmlString LineBreaksToHtml(this MvcHtmlString template)
        {
            if (template == null)
                return null;

            var content = template.ToString().FormatTemplate(new Dictionary<string, string> { { "\r\n", "<br/>" } });
            return new MvcHtmlString(content);
        }
    }
}