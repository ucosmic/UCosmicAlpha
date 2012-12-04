using System;
using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
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

        [GET("throw")]
        [TryAuthorize(Roles = "Elmah Viewer")]
        public virtual ActionResult Throw()
        {
            var ex = new Exception("This is a test exception thrown on purpose from the web server.");
            throw ex;
        }

        [GET("401")]
        public virtual ActionResult Unauthorized()
        {
            Response.StatusCode = 401;
            return View();
        }

        [GET("403")]
        public virtual ActionResult Forbidden()
        {
            Response.StatusCode = 403;
            return View();
        }

        [GET("404")]
        public virtual ActionResult NotFound()
        {
            Response.StatusCode = 404;
            return View();
        }
    }
}
