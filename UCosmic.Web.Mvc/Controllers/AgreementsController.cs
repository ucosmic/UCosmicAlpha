using System;
using System.Diagnostics;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    [UserVoiceForum(UserVoiceForum.Agreements)]
    public partial class AgreementsController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public AgreementsController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("agreements")]
        public virtual ActionResult Index()
        {
            var tenancy = Request.Tenancy() ?? new Tenancy();

            // first check style domain
            if (!string.IsNullOrWhiteSpace(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                return RedirectToAction(MVC.Agreements.TenantIndex(tenancy.StyleDomain));

            if (tenancy.TenantId.HasValue)
            {
                var establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                if (establishment != null && !string.IsNullOrWhiteSpace(establishment.WebsiteUrl))
                {
                    var domain = (establishment.WebsiteUrl.StartsWith("www.")) ? establishment.WebsiteUrl.Substring(4) : establishment.WebsiteUrl;
                    return RedirectToAction(MVC.Agreements.TenantIndex(domain));
                }
            }

            var publicText = AgreementVisibility.Public.AsSentenceFragment();
            var ownersQueryable = _entities.Query<Agreement>()
                .Where(x => x.VisibilityText == publicText)
                .SelectMany(x => x.Participants)
                .Where(x => x.IsOwner)
                .Select(x => x.Establishment)
                .Where(x => x.IsMember)
                .Distinct()
            ;
            var ancestorsQueryable = _entities.Query<Establishment>()
                .Where(x => x.Offspring.Any(y => ownersQueryable.Select(z => z.RevisionId).Contains(y.OffspringId)))
                .Distinct()
            ;
            var owners = ownersQueryable.Union(ancestorsQueryable).ToArray();

            var models = owners.Select(x => new AgreementOwningTenant
            {
                Id = x.RevisionId,
                ParentId = x.Parent != null ? x.Parent.RevisionId : (int?)null,
                OfficialName = x.OfficialName,
                WebsiteUrl = x.WebsiteUrl,
                StyleDomain = x.WebsiteUrl.StartsWith("www.", StringComparison.OrdinalIgnoreCase)
                    ? x.WebsiteUrl.Substring(4) : x.WebsiteUrl,

            }).ToArray();

            return View(MVC.Agreements.Views.Owners, models);
        }

        [GET("{domain}/agreements")]
        public virtual ActionResult TenantIndex(string domain)
        {
            var detailUrl = Url.RouteUrl(null, new { controller = "Agreements", action = "Show", agreementId = 0 });
            Debug.Assert(detailUrl != null);
            detailUrl = detailUrl.Replace("0", "{0}");
            ViewBag.DetailUrl = detailUrl;

            var partnerPlacesApi = Url.HttpRouteUrl(null, new { controller = "AgreementPartners", action = "GetPartnerPlaces", domain = "0", placeType = "1" });
            Debug.Assert(partnerPlacesApi != null);
            partnerPlacesApi = partnerPlacesApi.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.PartnerPlacesApi = partnerPlacesApi;

            var partnersApi = Url.HttpRouteUrl(null, new { controller = "AgreementPartners", action = "GetPartners", domain = "0" });
            Debug.Assert(partnersApi != null);
            partnersApi = partnersApi.Replace("0", "{0}");
            ViewBag.PartnersApi = partnersApi;

            var graphicsCircleApi = Url.HttpRouteUrl(null, new { controller = "Graphics", action = "GetCircle" });
            Debug.Assert(graphicsCircleApi != null);
            ViewBag.GraphicsCircleApi = graphicsCircleApi;

            var summaryApi = Url.HttpRouteUrl(null, new { controller = "Agreements", action = "GetSummary", domain = "0" });
            Debug.Assert(summaryApi != null);
            summaryApi = summaryApi.Replace("0", "{0}");
            ViewBag.SummaryApi = summaryApi;

            var visibility = _queryProcessor.Execute(new MyAgreementsVisibility(User, domain));
            ViewBag.AgreementsVisibility = visibility;
            ViewBag.AgreementsDomain = domain;

            ViewBag.EmployeesEstablishmentId = _queryProcessor.Execute(new EstablishmentByDomain(domain)).RevisionId as int?;
            return View(MVC.Agreements.Views.SearchTable);
        }

        [GET("agreements/{agreementId:int}")]
        public virtual ActionResult Show(int agreementId)
        {
            var entity = _queryProcessor.Execute(new AgreementById(User, agreementId));
            if (entity == null) return HttpNotFound();

            var agreementPartnersApi = Url.HttpRouteUrl(null, new { controller = "AgreementPartners", action = "GetPartners", agreementId = 0 });
            Debug.Assert(agreementPartnersApi != null);
            agreementPartnersApi = agreementPartnersApi.Replace("0", "{0}");
            ViewBag.AgreementPartnersApi = agreementPartnersApi;

            var visibility = _queryProcessor.Execute(new MyAgreementVisibility(User, agreementId));
            ViewBag.AgreementVisibility = visibility;

            ViewBag.AgreementId = agreementId;
            return View();
        }

        [GET("agreements/new/")]
        [TryAuthorize(Roles = RoleName.AgreementManagers)]
        public virtual ViewResult New()
        {
            ViewBag.Id = 0;
            return View(MVC.Agreements.Views.Form);
        }

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

        [GET("agreements/settings", ControllerPrecedence = 1)]
        [TryAuthorize(Roles = RoleName.AgreementSupervisor)]
        public virtual ViewResult Settings()
        {
            return View();
        }

        [GET("/agreements/info/")]
        public virtual ActionResult Info(string domain)
        {

            return View("info", "_Layout_riot");
        }

    }
}
