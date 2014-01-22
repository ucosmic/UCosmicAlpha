using System;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

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
        [GET("my/activities")]
        public virtual ActionResult Get()
        {
            if (ControllerContext.IsChildAction)
            {
                BagUrlFormats();
                return PartialView(MVC.MyProfile.Views._Activities);
            }
            return HttpNotFound();
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
            BagUrlFormats();
            return View(MVC.Activities.Views.Edit);
        }

        private void BagUrlFormats()
        {
            var edit = Url.RouteUrl(new {controller = "Activities", action = "Edit", activityId = 0});
            Debug.Assert(edit != null);
            edit = edit.Replace("0", "{0}");
            ViewBag.EditUrl = edit;

            var activity = Url.HttpRouteUrl(null, new { controller = "Activities", action = "Get", activityId = 0 });
            Debug.Assert(activity != null);
            activity = activity.Replace("0", "{0}");
            ViewBag.ActivityApi = activity;

            var activities = Url.HttpRouteUrl(null, new { controller = "Activities", action = "Get" });
            Debug.Assert(activities != null);
            ViewBag.ActivitiesApi = activities;

            var activityCopy = Url.HttpRouteUrl(null, new { controller = "Activities", action = "GetCopy", activityId = 0 });
            Debug.Assert(activityCopy != null);
            activityCopy = activityCopy.Replace("0", "{0}");
            ViewBag.ActivityCopyApi = activityCopy;

            var activityReplace = Url.HttpRouteUrl(null, new { controller = "Activities", action = "PutMove", workCopyActivityId = 0, originalActivityId = 1, mode = ActivityMode.Draft });
            Debug.Assert(activityReplace != null);
            activityReplace = activityReplace.Replace("0", "{0}").Replace("1", "{1}").Replace(ActivityMode.Draft.ToString(), "{2}");
            ViewBag.ActivityReplaceApi = activityReplace;

            var type = Url.HttpRouteUrl(null, new { controller = "ActivityTypes", action = "Put", activityId = 0, activityTypeId = 1 });
            Debug.Assert(type != null);
            type = type.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.TypeApi = type;

            var typeIcon = Url.HttpRouteUrl(null, new { controller = "EmployeeModuleSettings", action = "GetIcon", typeId = 0 });
            Debug.Assert(typeIcon != null);
            typeIcon = typeIcon.Replace("0", "{0}");
            ViewBag.TypeIconApi = typeIcon;

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

            var documentsValidate = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "PostValidate", activityId = 0 });
            Debug.Assert(documentsValidate != null);
            documentsValidate = documentsValidate.Replace("0", "{0}");
            ViewBag.DocumentsValidateApi = documentsValidate;

            var documentIcon = Url.HttpRouteUrl(null, new { controller = "ActivityDocuments", action = "GetThumbnail", activityId = 0, documentId = 1 });
            Debug.Assert(documentIcon != null);
            documentIcon = documentIcon.Replace("0", "{0}").Replace("1", "{1}");
            ViewBag.DocumentIconApi = documentIcon;
        }

        [GET("activities/{activityId:int}")]
        public virtual ActionResult Details(int activityId)
        {
            var entity = _queryProcessor.Execute(new PublicActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Types.Select(y => y.Type),
                    x => x.Locations.Select(y => y.Place),
                    x => x.Tags,
                    x => x.Documents,
                    x => x.Activity.Person.Emails,
                }

            });
            if (entity == null) return HttpNotFound();

            var model = Mapper.Map<ActivityPublicViewModel>(entity);
            ViewBag.CustomBib = entity.Activity.Person.DisplayName;
            ViewBag.isActivity = true;
            @ViewBag.Faculty = "current";
            return View(model);
        }
    }
}
