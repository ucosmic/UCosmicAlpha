using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.InstitutionalAgreements)]
    [TryAuthorize(Roles = RoleName.InstitutionalAgreementManagers)]
    public partial class AgreementsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public virtual ActionResult Index()
        {
            return View();
        }


        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Agreements.Views.Form);
        }

        public virtual ViewResult Edit(int agreementId)
        {
            ViewBag.Id = agreementId;
            return View(MVC.Agreements.Views.Form);
        }

    }
}
