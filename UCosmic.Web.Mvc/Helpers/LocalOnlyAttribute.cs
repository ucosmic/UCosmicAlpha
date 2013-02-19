using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace UCosmic.Web.Mvc
{
    // use this attribute on WebAPI controllers or actions that
    // should only be accessible from this domain / IP.
    public class LocalOnlyAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (!actionContext.Request.GetIsLocal())
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.Forbidden, "This API endpoint is not public.");
            }

        }
    }
}