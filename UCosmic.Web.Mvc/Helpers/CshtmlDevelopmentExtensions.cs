using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class CshtmlDevelopmentExtensions
    {
        public static bool IsOffline(this HtmlHelper htmlHelper)
        {
#if DEBUG && OFFLINE
            return true;
#else
            return false;
#endif
        }

        public static bool IsDebug(this HtmlHelper htmlHelper)
        {
#if DEBUG
            return true;
#else
            return false;
#endif
        }
    }
}