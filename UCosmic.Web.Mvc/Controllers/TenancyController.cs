using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class TenancyController : Controller
    {
        [HttpGet]
        [GET("as/{id?}")]
        public virtual RedirectResult Tenant(string id, string returnUrl)
        {
            // only change the style domain of the tenancy cookie
            var tenancy = Request.Tenancy();
            if (tenancy == null) tenancy = new Tenancy { StyleDomain = id };
            else tenancy.StyleDomain = id;

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
