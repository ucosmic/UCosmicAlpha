using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    [RestfulRouteConvention]
    public partial class AgreementsController : Controller
    {
        //
        // GET: /Agreements/

        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
