using System.Linq;
using System.Web.Mvc;
using UCosmic;
using UCosmic.Domain.Places;

namespace UCosmicLayout3.Controllers
{
    public partial class HomeController : Controller
    {
        private readonly IQueryEntities _queryEntities = null;

        public HomeController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        public virtual ActionResult Index()
        {
            var test = _queryEntities.Query<Place>().ToArray();
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
