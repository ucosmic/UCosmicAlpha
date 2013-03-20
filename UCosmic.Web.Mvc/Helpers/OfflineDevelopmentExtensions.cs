using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class OfflineDevelopmentExtensions
    {
        public static bool IsOffline(this HtmlHelper htmlHelper)
        {
#if DEBUG && OFFLINE
            return true;
#else
            return false;
#endif
        }
    }
}