using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public class DevelopmentOnlyAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
#if !DEBUG
            filterContext.HttpContext.Response.StatusCode = 404;
#endif
        }
    }
}