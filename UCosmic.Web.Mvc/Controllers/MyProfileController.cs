using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Activities;
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
        public virtual ActionResult Index(string tab)
        {
            var model = new ProfileModel { Tab = tab };
            return View(model);
        }

        [Authorize]
        [GET("my/activities/{activityId}")]
        public virtual ActionResult ActivityEdit(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Person.User,
                }
            });
            if (activity == null ||
                !User.Identity.Name.Equals(activity.Person.User.Name, StringComparison.OrdinalIgnoreCase))
                return HttpNotFound();

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

        [Authorize]
        [GET("my/language-expertise/{expertiseId}")]
        public virtual ActionResult LanguageExpertiseEdit(string expertiseId)
        {
            var model = new LanguageExpertiseModel { ExpertiseId = expertiseId };
            return View(model);
        }

        [Authorize]
        [GET("my/international-affiliation/{affiliationId}")]
        public virtual ActionResult InternationalAffiliationEdit(string affiliationId)
        {
            var model = new InternationalAffiliationModel { AffiliationId = affiliationId };
            return View(model);
        }
    }
}
