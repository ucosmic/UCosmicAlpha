using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    [TryAuthorize(Roles = RoleName.UserManagers)]
    public partial class UsersController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
