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
        private readonly IHandleCommands<CopyActivityAndValues> _copyActivityAndValues;

        public ActivitiesController(IProcessQueries queryProcessor
            , IHandleCommands<CreateActivityAndValues> createActivityAndValues
            , IHandleCommands<CopyActivityAndValues> copyActivityAndValues
        )
        {
            _queryProcessor = queryProcessor;
            _createActivityAndValues = createActivityAndValues;
            _copyActivityAndValues = copyActivityAndValues;
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
            var activity = _queryProcessor.Execute(new ActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Person.User,
                }
            });
            if (activity == null || activity.Person.User == null ||
                !User.Identity.Name.Equals(activity.Person.User.Name, StringComparison.OrdinalIgnoreCase))
                return HttpNotFound();

            // make sure there is a copy of the activity for editing
            var copyActivityAndValues = new CopyActivityAndValues(User, activityId);
            _copyActivityAndValues.Handle(copyActivityAndValues);

            ViewBag.ActivityId = activityId;
            ViewBag.ActivityWorkCopyId = copyActivityAndValues.CreatedActivity.RevisionId;
            return View();
        }
    }
}
