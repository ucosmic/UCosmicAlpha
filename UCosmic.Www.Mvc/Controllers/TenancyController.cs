using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class TenancyController : Controller
    {
        [HttpGet]
        [GET("as/{id?}")]
        public virtual RedirectResult Tenant(string id, string returnUrl)
        {
            Response.Tenancy(id);
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
