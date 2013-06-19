using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [DevelopmentOnly]
    [RestfulRouteConvention]
    public partial class ApiTestController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
