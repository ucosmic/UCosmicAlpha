using System.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class TenancyController : Controller
    {
        public virtual RedirectResult Tenant(string id, string returnUrl)
        {
            Response.Tenancy(id);
            return Redirect(returnUrl ?? Request.ApplicationPath);
        }

        [ChildActionOnly]
        public virtual PartialViewResult Css()
        {
            var tenancy = Request.Tenancy();
            return PartialView(MVC.Shared.Views._LayoutCss, tenancy);
        }
    }
}
