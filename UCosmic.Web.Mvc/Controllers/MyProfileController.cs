using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class MyProfileController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public MyProfileController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [Authorize]
        [GET("my/profile")]
        public virtual ActionResult Index()
        {
            return View();
        }
    }
}
