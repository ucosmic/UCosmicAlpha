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
        [GET("my")]
        [GET("my/profile", ActionPrecedence = 1)]
        public virtual ActionResult Index(string tab)
        {
            ViewBag.Tab = tab;
            return View();
        }

        [Authorize]
        [GET("my/activities/{activityId:int}")]
        [GET("my/activities/{activityId:int}/edit", ActionPrecedence = 1)]
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
        [GET("my/degrees/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewDegree()
        {
            ViewBag.DegreeId = 0;
            return View(MVC.MyProfile.Views.DegreeForm);
        }

        [Authorize]
        [GET("my/degrees/{degreeId:int}")]
        [GET("my/degrees/{degreeId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditDegree(int degreeId)
        {
            ViewBag.DegreeId = degreeId;
            return View(MVC.MyProfile.Views.DegreeForm);
        }

        [Authorize]
        [GET("my/geographic-expertise/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewGeographicExpertise()
        {
            ViewBag.ExpertiseId = 0;
            return View(MVC.MyProfile.Views.GeographicExpertiseForm);
        }

        [Authorize]
        [GET("my/geographic-expertise/{expertiseId:int}")]
        [GET("my/geographic-expertise/{expertiseId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditGeographicExpertise(int expertiseId)
        {
            ViewBag.ExpertiseId = expertiseId;
            return View(MVC.MyProfile.Views.GeographicExpertiseForm);
        }

        [Authorize]
        [GET("my/language-expertise/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewLanguageExpertise()
        {
            ViewBag.ExpertiseId = 0;
            return View(MVC.MyProfile.Views.LanguageExpertiseForm);
        }

        [Authorize]
        [GET("my/language-expertise/{expertiseId:int}")]
        [GET("my/language-expertise/{expertiseId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditLanguageExpertise(int expertiseId)
        {
            ViewBag.ExpertiseId = expertiseId;
            return View(MVC.MyProfile.Views.LanguageExpertiseForm);
        }

        [Authorize]
        [GET("my/international-affiliations/new", ControllerPrecedence = 1)]
        public virtual ActionResult NewInternationalAffiliation()
        {
            ViewBag.AffiliationId = 0;
            return View(MVC.MyProfile.Views.InternationalAffiliationForm);
        }

        [Authorize]
        [GET("my/international-affiliations/{affiliationId:int}")]
        [GET("my/international-affiliations/{affiliationId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult EditInternationalAffiliation(int affiliationId)
        {
            ViewBag.AffiliationId = affiliationId;
            return View(MVC.MyProfile.Views.InternationalAffiliationForm);
        }
    }
}
