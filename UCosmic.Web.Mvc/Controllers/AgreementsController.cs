using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

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

        [GET("agreements/{agreementId:int}")]
        public virtual ViewResult Show(int agreementId)
        {
            ViewBag.Show = true;
            return View(MVC.Agreements.Views.PublicView);
        }

        [GET("agreements/{domain?}")]
        public virtual ActionResult Index(string domain = null)
        {
            // when no domain is passed, try to detect it
            if (string.IsNullOrWhiteSpace(domain))
            {
                var tenancy = Request.Tenancy() ?? new Tenancy();

                // first check style domain
                if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                    return RedirectToAction(MVC.Agreements.Index(tenancy.StyleDomain));

                if (tenancy.TenantId.HasValue)
                {
                    var establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                    if (establishment != null && !string.IsNullOrWhiteSpace(establishment.WebsiteUrl))
                    {
                        domain = (establishment.WebsiteUrl.StartsWith("www.")) ? establishment.WebsiteUrl.Substring(4) : establishment.WebsiteUrl;
                        return RedirectToAction(MVC.Agreements.Index(domain));
                    }
                }

                return View(MVC.Agreements.Views.Owners);
            }

            ViewBag.Domain = domain;
            return View();
        }


        [GET("agreements/new/", SitePrecedence = 1)]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Agreements.Views.Form);
        }

        //[GET("agreements/edit/", SitePrecedence = 1)]
        //[TryAuthorize(Roles = RoleName.AgreementManagers)]
        //public virtual ViewResult Edit()
        //{
        //    ViewBag.Id = 0;
        //    return View(MVC.Agreements.Views.Form);
        //}

        [GET("agreements/{agreementId:int}/edit")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ActionResult Edit(int agreementId)
        {
            var agreement = _queryProcessor.Execute(new AgreementById(User, agreementId)
            {
                MustBeOwnedByPrincipal = true
            });

            if (agreement == null)
                return HttpNotFound();

            ViewBag.Id = agreement.Id;
            return View(MVC.Agreements.Views.Form);
        }

        [GET("agreements/settings", SitePrecedence = 1)]
        [TryAuthorize(Roles = RoleName.AgreementSupervisor)]
        public virtual ViewResult Settings()
        {
            return View();
        }

    }
}
