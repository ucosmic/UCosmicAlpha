using System.Web.Mvc;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;
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

        [Authorize]
        [GET("my/activity/{activityId}")]
        public virtual ActionResult ActivityEdit(int activityId)
        {
            var model = new ActivityModel { ActivityId = activityId };
            return View(model);
        }
    }
}
