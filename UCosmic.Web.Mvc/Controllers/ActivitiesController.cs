using System;
using System.Diagnostics;
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
            var command = new CreateActivityAndValues(User);
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
            BagEditApiUrls();
            return View(MVC.Activities.Views.Edit);
        }

        private void BagEditApiUrls()
        {
            var activity2 = Url.HttpRouteUrl(null, new { controller = "Activities", action = "Get2", activityId = 0 });
            Debug.Assert(activity2 != null);
            activity2 = activity2.Replace("0", "{0}");
            ViewBag.Activity2Api = activity2;

            var activity = Url.HttpRouteUrl(null, new { controller = "Activities", action = "Put", activityId = 0 });
            Debug.Assert(activity != null);
            activity = activity.Replace("0", "{0}");
            ViewBag.ActivityApi = activity;

            var activityReplace = Url.HttpRouteUrl(null, new { controller = "Activities", action = "PutMove", workCopyActivityId = 0, originalActivityId = 1, mode = ActivityMode.Draft });
            Debug.Assert(activityReplace != null);
            activityReplace = activityReplace.Replace("0", "{0}").Replace("1", "{1}").Replace(ActivityMode.Draft.ToString(), "{2}");
            ViewBag.ActivityReplaceApi = activityReplace;

            var types = Url.HttpRouteUrl(null, new { controller = "ActivityTypes", action = "Get", activityId = 0 });
            Debug.Assert(types != null);
            types = types.Replace("0", "{0}");
            ViewBag.TypesApi = types;

            var type = Url.HttpRouteUrl(null, new { controller = "ActivityTypes", action = "Put", activityId = 0, activityTypeId = 1 });
            Debug.Assert(type != null);
            type = type.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.TypeApi = type;

            var places = Url.HttpRouteUrl(null, new { controller = "ActivityPlaces", action = "Get", activityId = 0 });
            Debug.Assert(places != null);
            places = places.Replace("0", "{0}");
            ViewBag.PlacesApi = places;

            var place = Url.HttpRouteUrl(null, new { controller = "ActivityPlaces", action = "Put", activityId = 0, placeId = 1 });
            Debug.Assert(place != null);
            place = place.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.PlaceApi = place;

            var placeOptions = Url.HttpRouteUrl(null, new { controller = "ActivityPlaces", action = "GetOptions" });
            Debug.Assert(placeOptions != null);
            ViewBag.PlaceOptionsApi = placeOptions;

            var tags = Url.HttpRouteUrl(null, new { controller = "ActivityTags", action = "Get", activityId = 0 });
            Debug.Assert(tags != null);
            tags = tags.Replace("0", "{0}");
            ViewBag.TagsApi = tags;

            var establishmentNames = Url.HttpRouteUrl(null, new { controller = "EstablishmentNames", action = "GetByKeyword" });
            Debug.Assert(establishmentNames != null);
            ViewBag.EstablishmentNamesApi = establishmentNames;

            var documents = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "Get", activityId = 0 });
            Debug.Assert(documents != null);
            documents = documents.Replace("0", "{0}");
            ViewBag.DocumentsApi = documents;

            var document = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "Get", activityId = 0, documentId = 1 });
            Debug.Assert(document != null);
            document = document.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.DocumentApi = document;

            var documentsValidate = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "PostValidate" });
            Debug.Assert(documentsValidate != null);
            ViewBag.DocumentsValidateApi = documentsValidate;

            var documentIcon = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "GetThumbnail", activityId = 0, documentId = 1 });
            Debug.Assert(documentIcon != null);
            documentIcon = documentIcon.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.DocumentIconApi = documentIcon;
        }
    }
}
