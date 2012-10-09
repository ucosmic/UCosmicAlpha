using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class HomeController : Controller
    {
        //private readonly IQueryEntities _queryEntities;

        //public HomeController(IQueryEntities queryEntities)
        //{
        //    _queryEntities = queryEntities;
        //}

        [GET("")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("employees")]
        public virtual ActionResult Employees()
        {
            return View();
        }

        [GET("alumni")]
        public virtual ActionResult Alumni()
        {
            return View();
        }

        [GET("students")]
        public virtual ActionResult Students()
        {
            return View();
        }

        [GET("representatives")]
        public virtual ActionResult Representatives()
        {
            return View();
        }

        [GET("travel")]
        public virtual ActionResult Travel()
        {
            return View();
        }

        [GET("corporate-engagement")]
        public virtual ActionResult CorporateEngagement()
        {
            return View();
        }

        [GET("global-press")]
        public virtual ActionResult GlobalPress()
        {
            TempData.Add("Flasher", "This is the global press page.");
            return View();
        }
    }
}
