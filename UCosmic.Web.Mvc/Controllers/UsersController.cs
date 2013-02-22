using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    public partial class UsersController : Controller
    {
        [Authorize(Roles = RoleName.SecurityAdministrators)]
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
