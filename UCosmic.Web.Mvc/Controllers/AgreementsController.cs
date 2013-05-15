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

        public virtual ViewResult Index()
        {
            return View();
        }

        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Establishments.Views.Form);
        }

        [GET("created")]
        public virtual ActionResult Created(string location)
        {
            if (!string.IsNullOrWhiteSpace(location))
            {
                // strip id out of location header
                var id = location.GetLastInt();

                if (id.HasValue)
                {
                    TempData.Flash("Establishment was successfully created.");
                    return RedirectToAction(MVC.Establishments.Show(id.Value));
                }
            }
            return HttpNotFound();
        }

        //public virtual ActionResult Show(int id)
        //{
        //    var entity = _queryProcessor.Execute(new EstablishmentById(id));
        //    if (entity == null)
        //        return HttpNotFound();

        //    ViewBag.Id = id;
        //    return View(MVC.Establishments.Views.Form);
        //}


    }
}
