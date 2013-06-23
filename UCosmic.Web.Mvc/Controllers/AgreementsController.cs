using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    //[RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.Agreements)]
    public partial class AgreementsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public AgreementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("agreements/tim-is-moving-this-to-form")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("agreements")]
        public virtual ViewResult DansIndex()
        {
            return View();
        }

        [GET("agreements/new")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Agreements.Views.Form);
        }

        [GET("agreements/{agreementId}/edit")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ViewResult Edit(int agreementId)
        {
            ViewBag.Id = agreementId;
            return View(MVC.Agreements.Views.Form);
        }

        [GET("agreements/settings")]
        [TryAuthorize(Roles = RoleName.AgreementSupervisor)]
        public virtual ViewResult Settings()
        {
            return View();
        }

    }
}
