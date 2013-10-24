using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class EmployeesController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _queryEntities;

        public EmployeesController(IProcessQueries queryProcessor, IQueryEntities queryEntities)
        {
            _queryProcessor = queryProcessor;
            _queryEntities = queryEntities;
        }

        [GET("employees")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("{domain}/employees")]
        public virtual ActionResult TenantIndex(string domain)
        {
            ViewBag.EmployeesDomain = domain;
            return View();
        }

    }
}
