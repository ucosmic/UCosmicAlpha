using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class ActivitiesController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateActivityAndValues> _createActivityAndValues;

        public ActivitiesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateActivityAndValues> createActivityAndValues
        )
        {
            _queryProcessor = queryProcessor;
            _createActivityAndValues = createActivityAndValues;
        }

        [Authorize]
        [POST("my/activities")]
        public virtual RedirectToRouteResult Create()
        {
            var command = new CreateActivityAndValues(User, ActivityMode.Draft);
            _createActivityAndValues.Handle(command);
            return RedirectToAction(MVC.Activities.Edit(command.CreatedActivity.RevisionId));
        }

        [Authorize]
        [GET("my/activities/{activityId:int}", ActionPrecedence = 2)]
        [GET("my/activities/{activityId:int}/edit", ActionPrecedence = 1)]
        public virtual ActionResult Edit(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Person.User,
                }
            });
            if (activity == null || activity.Person.User == null ||
                !User.Identity.Name.Equals(activity.Person.User.Name, StringComparison.OrdinalIgnoreCase))
                return HttpNotFound();

            ViewBag.ActivityId = activityId;
            return View();
        }
    }
}
