using System.Web.Mvc;
using AttributeRouting;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RoutePrefix("reps")]
    public partial class RepsController : Controller
    {
        [GET("settings")]
        public virtual ActionResult Settings()
        {
            return View();
        }
    }
}
