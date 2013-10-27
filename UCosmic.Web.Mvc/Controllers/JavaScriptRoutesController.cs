using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RoutePrefix("scripts/app/routes")]
    public partial class JavaScriptRoutesController : Controller
    {
        [GET("employees.js", AppendTrailingSlash = false)]
        public virtual PartialViewResult Employees()
        {
            Response.ContentType = "application/javascript";
            return PartialView();
        }
    }
}
