using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Activities;

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
            ViewBag.Tab = tab;
            return View();
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

            ViewBag.ActivityId = activityId;
            return View();
        }

        [Authorize]
        [GET("my/degree/{degreeId:int}")]
        public virtual ActionResult DegreeEdit(string degreeId)
        {
            ViewBag.DegreeId = degreeId;
            return View();
        }

        [Authorize]
        [GET("my/geographic-expertise/{expertiseId:int}")]
        public virtual ActionResult GeographicExpertiseEdit(string expertiseId)
        {
            ViewBag.ExpertiseId = expertiseId;
            return View();
        }

        [Authorize]
        [GET("my/language-expertise/{expertiseId:int}")]
        public virtual ActionResult LanguageExpertiseEdit(string expertiseId)
        {
            ViewBag.ExpertiseId = expertiseId;
            return View();
        }

        [Authorize]
        [GET("my/international-affiliation/{affiliationId:int}")]
        public virtual ActionResult InternationalAffiliationEdit(string affiliationId)
        {
            ViewBag.AffiliationId = affiliationId;
            return View();
        }
    }
}
