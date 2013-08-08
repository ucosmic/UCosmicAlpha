using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class LocalizationHelpers
    {
        public static IHtmlString MetaAcceptLanguage<T>(this HtmlHelper<T> html)
        {
            var acceptLanguage = HttpUtility.HtmlAttributeEncode(Thread.CurrentThread.CurrentUICulture.ToString());
            return new HtmlString(string.Format("<meta name='accept-language' content='{0}'>", acceptLanguage));
        }
    }
}
