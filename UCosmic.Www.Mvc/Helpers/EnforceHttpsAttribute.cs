using System;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = false)]
    public class EnforceHttpsAttribute : RequireHttpsAttribute
    {
        // ReSharper disable RedundantOverridenMember
        protected override void HandleNonHttpsRequest(AuthorizationContext filterContext)
        {
            base.HandleNonHttpsRequest(filterContext);

#if APPHARBOR
            // RequireHttps does not work in AppHarbor: http://stackoverflow.com/a/8977247/304832
            var xForwardedProtoHeader = filterContext.HttpContext.Request.Headers["X-Forwarded-Proto"];
            if (filterContext.Result is RedirectResult &&
                "https".Equals(xForwardedProtoHeader, StringComparison.InvariantCultureIgnoreCase))
                filterContext.Result = null;
#endif
        }
        // ReSharper restore RedundantOverridenMember
    }
}