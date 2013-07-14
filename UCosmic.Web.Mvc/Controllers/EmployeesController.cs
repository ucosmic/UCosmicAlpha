using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    //[RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class EmployeesController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public EmployeesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        //[GET("employees/{domain?}")]
        [GET("employees")]
        public virtual ActionResult Index(/*string domain = null*/)
        {
            //// when no domain is passed, try to detect it
            //if (string.IsNullOrWhiteSpace(domain))
            //{
            //    var tenancy = Request.Tenancy() ?? new Tenancy();

            //    // first check style domain
            //    if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
            //        return RedirectToAction(MVC.Employees.Index(tenancy.StyleDomain));

            //    if (tenancy.TenantId.HasValue)
            //    {
            //        var establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
            //        if (establishment != null && !string.IsNullOrWhiteSpace(establishment.WebsiteUrl))
            //        {
            //            domain = (establishment.WebsiteUrl.StartsWith("www.")) ? establishment.WebsiteUrl.Substring(4) : establishment.WebsiteUrl;
            //            return RedirectToAction(MVC.Employees.Index(domain));
            //        }
            //    }

            //    return View(MVC.Employees.Views.Owners);
            //}

            //ViewBag.Domain = domain;
            return View();
        }

        //[GET("employees/{agreementId:int}")]
        //public virtual ViewResult Show(int agreementId)
        //{
        //    return View();
        //}

        //[GET("employees/new/", SitePrecedence = 1)]
        //[TryAuthorize(Roles = RoleName.AgreementManagers)]
        //public virtual ViewResult New()
        //{
        //    ViewBag.Id = 0;
        //    return View(MVC.Employees.Views.Form);
        //}

        //[GET("employees/{agreementId:int}/edit")]
        //[TryAuthorize(Roles = RoleName.AgreementManagers)]
        //public virtual ActionResult Edit(int agreementId)
        //{
        //    var agreement = _queryProcessor.Execute(new AgreementById(User, agreementId)
        //    {
        //        MustBeOwnedByPrincipal = true
        //    });

        //    if (agreement == null)
        //        return HttpNotFound();

        //    ViewBag.Id = agreement.Id;
        //    return View(MVC.Employees.Views.Form);
        //}

        //[GET("employees/settings", SitePrecedence = 1)]
        //[TryAuthorize(Roles = RoleName.AgreementSupervisor)]
        //public virtual ViewResult Settings()
        //{
        //    return View();
        //}

    }
}
