using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Models;

namespace UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Controllers
{
    public class ActivityListServices
    {
        public ActivityListServices(IProcessQueries queryProcessor)
        {
            QueryProcessor = queryProcessor;
        }

        public IProcessQueries QueryProcessor { get; private set; }
    }

    //[Authenticate]
    public partial class ActivityListController : Controller
    {
        private readonly ActivityListServices _services;

        public ActivityListController(ActivityListServices services)
        {
            _services = services;
        }

        public const int ShortListLength = 5;

        [HttpGet]
        //[ActionName("_short-list")]
        public virtual PartialViewResult ShortList()
        {
            var query = new MyActivities
            {
                Principal = User,
                PageSize = ShortListLength,
                OrderBy = new Dictionary<Expression<Func<Activity, object>>, OrderByDirection>
                {
                    { a => a.UpdatedOn, OrderByDirection.Descending },
                },
            };
            var activities = _services.QueryProcessor.Execute(query);
            var model = Mapper.Map<ActivitiesPage>(activities);
            return PartialView(MVC.ActivitiesDeprecated.Shared.Views._short_list, model);
        }

        [HttpGet]
        //[ActionName("activities-page")]
        //[OpenTopTab(TopTabName.FacultyStaff)]
        public virtual ActionResult Page(int pageNumber = 1)
        {
            if (pageNumber < 1)
                return RedirectToAction(MVC.ActivitiesDeprecated.ActivityList.Page());

            var query = new MyActivities
            {
                Principal = User,
                PageNumber = pageNumber,
                PageSize = int.MaxValue,
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    a => a.Tags,
                },
                OrderBy = new Dictionary<Expression<Func<Activity, object>>, OrderByDirection>
                {
                    { a => a.DraftedValues.Title, OrderByDirection.Ascending },
                    { a => a.Values.Title, OrderByDirection.Ascending },
                },
            };
            var activities = _services.QueryProcessor.Execute(query);
            if (activities.PageCount > 0 && activities.PageCount < pageNumber)
                return RedirectToAction(MVC.ActivitiesDeprecated.ActivityList.Page(activities.PageCount));
            var model = Mapper.Map<ActivitiesPage>(activities);
            return View(MVC.ActivitiesDeprecated.Shared.Views.activities_page, model);
        }
    }

    //public static class ActivityListRouter
    //{
    //    private static readonly string Area = MVC.Activities.Name;
    //    private static readonly string Controller = MVC.Activities.ActivityList.Name;

    //    public class ShortListRoute : MvcRoute
    //    {
    //        public ShortListRoute()
    //        {
    //            Url = "my/activities/short-list";
    //            DataTokens = new RouteValueDictionary(new { area = Area, });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityList.ActionNames.ShortList,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }

    //    public class PageRoute : MvcRoute
    //    {
    //        public PageRoute()
    //        {
    //            Url = "my/activities";
    //            DataTokens = new RouteValueDictionary(new { area = Area, });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityList.ActionNames.Page,
    //                pageNumber = UrlParameter.Optional,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }

    //    public class PageRouteWithPageNumber : PageRoute
    //    {
    //        public PageRouteWithPageNumber()
    //        {
    //            Url = "my/activities/page-{pageNumber}";
    //        }
    //    }
    //}
}
