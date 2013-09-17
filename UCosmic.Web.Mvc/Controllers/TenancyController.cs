using System;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class TenancyController : Controller
    {
        private readonly IProcessQueries _queries;

        public TenancyController(IProcessQueries queries)
        {
            _queries = queries;
        }

        [HttpGet]
        [GET("as/{id?}")]
        public virtual RedirectResult Tenant(string id, string returnUrl)
        {
            var styleDomain = id;
            var tenancy = Request.Tenancy() ?? new Tenancy();
            tenancy.StyleDomain = styleDomain;

            // account for www. prefix
            var wwwId = id;
            if (wwwId != null && !wwwId.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
                wwwId = string.Format("www.{0}", wwwId);
            wwwId = wwwId ?? "default";

            // find associated establishment
            var establishment = _queries.Execute(new EstablishmentByUrl(wwwId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Ancestors.Select(y => y.Ancestor),
                }
            });
            tenancy.TenantId = establishment != null ? establishment.RevisionId : (int?)null;

            // skin may be on a parent/ancestor establishment (SUNY constituents for example)
            var tenantEstablishment = establishment;
            while (tenantEstablishment != null && (string.IsNullOrWhiteSpace(tenancy.StyleDomain) ||
                !Directory.Exists(Server.MapPath(string.Format("~/styles/tenants/{0}", tenancy.StyleDomain)))))
            {
                tenantEstablishment = tenantEstablishment.Parent;
                if (tenantEstablishment == null) continue;
                tenancy.StyleDomain = tenantEstablishment.WebsiteUrl.GetUrlDomain();
            }

            Response.Tenancy(tenancy);
            return Redirect(returnUrl ?? Request.ApplicationPath);
        }

        [ChildActionOnly]
        [Route("tenancy/css")]
        public virtual PartialViewResult Css()
        {
            var tenancy = Request.Tenancy();
            return PartialView(MVC.Shared.Views._LayoutCss, tenancy);
        }
    }
}
