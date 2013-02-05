using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Controllers
{
    public class ActivityFormServices
    {
        public ActivityFormServices(IProcessQueries queryProcessor
            , IHandleCommands<CreateMyNewActivity> createCommandHandler
            , IHandleCommands<DraftMyActivity> draftCommandHandler
            , IHandleCommands<UpdateMyActivity> updateCommandHandler
            , IHandleCommands<PurgeMyActivity> purgeCommandHandler
        )
        {
            QueryProcessor = queryProcessor;
            CreateCommandHandler = createCommandHandler;
            DraftCommandHandler = draftCommandHandler;
            UpdateCommandHandler = updateCommandHandler;
            PurgeCommandHandler = purgeCommandHandler;
        }

        public IProcessQueries QueryProcessor { get; private set; }
        public IHandleCommands<CreateMyNewActivity> CreateCommandHandler { get; private set; }
        public IHandleCommands<DraftMyActivity> DraftCommandHandler { get; private set; }
        public IHandleCommands<UpdateMyActivity> UpdateCommandHandler { get; private set; }
        public IHandleCommands<PurgeMyActivity> PurgeCommandHandler { get; private set; }
    }

    //[Authenticate]
    public partial class ActivityFormController : Controller
    {
        private readonly ActivityFormServices _services;

        public ActivityFormController(ActivityFormServices services)
        {
            _services = services;
        }

        [HttpGet]
        [UnitOfWork]
        public virtual ActionResult New()
        {
            var command = new CreateMyNewActivity
            {
                Principal = User,
            };
            _services.CreateCommandHandler.Handle(command);
            return RedirectToAction(MVC.ActivitiesDeprecated.ActivityForm.Get(command.CreatedActivity.Number));
        }

        [HttpGet]
        //[HttpNotFoundOnNullModel]
        //[ActionName("activity-form")]
        //[OpenTopTab(TopTabName.FacultyStaff)]
        [ReturnUrlReferrer("dv/my/home")]
        public virtual ActionResult Get(int number)
        {
            var activity = _services.QueryProcessor.Execute(
                new MyActivityByNumber
                {
                    Principal = User,
                    Number = number,
                    EagerLoad = new Expression<Func<Activity, object>>[]
                    {
                        a => a.DraftedTags,
                    },
                }
            );
            if (activity == null) return HttpNotFound();
            var model = Mapper.Map<ActivityForm>(activity);
            if (model.Mode == ActivityMode.Protected)
                model.Mode = ActivityMode.Public;
            return View(MVC.ActivitiesDeprecated.Shared.Views.activity_form, model);
        }

        [HttpPut]
        [UnitOfWork]
        public virtual JsonResult Put(int number, ActivityForm model)
        {
            var command = new UpdateMyActivity
            {
                Principal = User,
                Number = number,
            };
            if (model.Mode == ActivityMode.Protected)
                model.Mode = ActivityMode.Public;
            Mapper.Map(model, command);
            _services.UpdateCommandHandler.Handle(command);
            var message = ModelState.IsValid ? SuccessMessage : null;
            return Json(message);
        }

        public const string SuccessMessage = "Your changes have been saved successfully.";

        [HttpPut]
        [UnitOfWork]
        public virtual JsonResult Draft(int number, ActivityForm model)
        {
            var command = new DraftMyActivity
            {
                Principal = User,
                Number = number,
            };
            if (model.Mode == ActivityMode.Protected)
                model.Mode = ActivityMode.Public;
            Mapper.Map(model, command);
            _services.DraftCommandHandler.Handle(command);
            return Json(null);
        }

        [HttpGet]
        //[ActionName("activity-delete")]
        //[OpenTopTab(TopTabName.FacultyStaff)]
        public virtual ViewResult Delete(int number, string returnUrl)
        {
            var activity = _services.QueryProcessor.Execute(
                new MyActivityByNumber
                {
                    Principal = User,
                    Number = number,
                    EagerLoad = new Expression<Func<Activity, object>>[]
                    {
                        a => a.DraftedTags,
                    },
                }
            );
            var model = Mapper.Map<ActivityForm>(activity);
            model.ReturnUrl = returnUrl;
            return View(MVC.ActivitiesDeprecated.Shared.Views.activity_delete, model);
        }

        [HttpDelete]
        [UnitOfWork]
        public virtual ActionResult Destroy(int number, string returnUrl)
        {
            var command = new PurgeMyActivity
            {
                Principal = User,
                Number = number,
            };
            _services.PurgeCommandHandler.Handle(command);
            return Redirect(returnUrl);
        }
    }

    //public static class ActivityFormRouter
    //{
    //    private static readonly string Area = MVC.Activities.Name;
    //    private static readonly string Controller = MVC.Activities.ActivityForm.Name;

    //    public class NewRoute : MvcRoute
    //    {
    //        public NewRoute()
    //        {
    //            Url = "my/activities/new";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.New,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }

    //    public class GetRoute : MvcRoute
    //    {
    //        public GetRoute()
    //        {
    //            Url = "my/activities/{number}/edit";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class PutRoute : MvcRoute
    //    {
    //        public PutRoute()
    //        {
    //            Url = "my/activities/{number}";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.Put,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodOverrideConstraint("POST", "PUT"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class DraftRoute : MvcRoute
    //    {
    //        public DraftRoute()
    //        {
    //            Url = "my/activities/{number}/draft";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.Draft,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodOverrideConstraint("POST", "PUT"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class DeleteRoute : MvcRoute
    //    {
    //        public DeleteRoute()
    //        {
    //            Url = "my/activities/{number}/delete";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.Delete,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }

    //    public class DestroyRoute : MvcRoute
    //    {
    //        public DestroyRoute()
    //        {
    //            Url = "my/activities/{number}";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityForm.ActionNames.Destroy,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodOverrideConstraint("POST", "DELETE"),
    //                number = new PositiveIntegerRouteConstraint(),
    //            });
    //        }
    //    }
    //}
}
