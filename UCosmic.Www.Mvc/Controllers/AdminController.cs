using System.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class AdminController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
