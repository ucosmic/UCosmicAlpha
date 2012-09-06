using System.Web.Mvc;

namespace UCosmic.Www.Mvc.Controllers
{
    public partial class HomeController : Controller
    {
        //private readonly IQueryEntities _queryEntities;

        //public HomeController(IQueryEntities queryEntities)
        //{
        //    _queryEntities = queryEntities;
        //}

        public virtual ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult Employees()
        {
            return View();
        }

        public virtual ActionResult Alumni()
        {
            return View();
        }

        public virtual ActionResult Students()
        {
            return View();
        }

        public virtual ActionResult Representatives()
        {
            return View();
        }

        public virtual ActionResult Travel()
        {
            return View();
        }

        public virtual ActionResult CorporateEngagement()
        {
            return View();
        }

        public virtual ActionResult GlobalPress()
        {
            TempData.Add("Flasher", "This is the global press page.");
            return View();
        }
    }
}
