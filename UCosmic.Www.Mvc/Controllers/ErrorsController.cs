using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    [RoutePrefix("errors")]
    public partial class ErrorsController : Controller
    {
        [GET("")]
        public virtual ActionResult Unexpected()
        {
            Response.StatusCode = 500;
            return View(MVC.Shared.Views.Error);
        }

        [GET("404")]
        public virtual ActionResult NotFound()
        {
            Response.StatusCode = 404;
            return View();
        }
    }
}
