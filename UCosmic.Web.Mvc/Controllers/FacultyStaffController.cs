using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    //[RestfulRouteConvention]
    [UserVoiceForum(UserVoiceForum.Employees)]
    public partial class FacultyStaffController : Controller
    {
        private readonly IProcessQueries _queryProcessor;

        public FacultyStaffController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [GET("facultystaff")]
        public virtual ActionResult Index(/*string domain = null*/)
        {

            return View();
        }
    }
}
