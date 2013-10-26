using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RoutePrefix("scripts")]
    public partial class JavaScriptsController : Controller
    {
        [GET("routes.js", AppendTrailingSlash = false)]
        public virtual PartialViewResult Routes()
        {
            return PartialView();
        }
    }
}
