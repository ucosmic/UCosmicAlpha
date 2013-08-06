using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace System.Web.Mvc
{
    public static class LocalizationHelpers
    {
        public static IHtmlString MetaAcceptLanguage<t>(this HtmlHelper<t> html)
        {
            var acceptLanguage = HttpUtility.HtmlAttributeEncode(Threading.Thread.CurrentThread.CurrentUICulture.ToString());


            return new HtmlString(String.Format("<meta name='accept-language' content='{0}'>",acceptLanguage));
        }
    }
}
