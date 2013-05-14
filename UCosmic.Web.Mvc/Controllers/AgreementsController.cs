using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.InstitutionalAgreements)]
    [TryAuthorize(Roles = RoleName.InstitutionalAgreementManagers)]
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
