using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Web.Mvc.Models;

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
        public virtual ActionResult Index(int? tab)
        {
            var model = new ProfileModel { TabIndex = tab.HasValue ? tab.Value : 0 };
            return View(model);
        }

        [Authorize]
        [GET("my/activity/{activityId}")]
        public virtual ActionResult ActivityEdit(int activityId)
        {
            var model = new ActivityModel { ActivityId = activityId };
            return View(model);
        }

        [Authorize]
        [GET("my/degree/{degreeId}")]
        public virtual ActionResult DegreeEdit(string degreeId)
        {
            var model = new DegreeModel { DegreeId = degreeId };
            return View(model);
        }

        [Authorize]
        [GET("my/geographic-expertise/{expertiseId}")]
        public virtual ActionResult GeographicExpertiseEdit(string expertiseId)
        {
            var model = new GeographicExpertiseModel {ExpertiseId = expertiseId};
            return View(model);
        }
    }
}
