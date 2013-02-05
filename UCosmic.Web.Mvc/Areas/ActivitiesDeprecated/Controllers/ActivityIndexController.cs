using System.Web.Mvc;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Areas.ActivitiesDeprecated.Controllers
{
    public class ActivityIndexServices
    {
        public ActivityIndexServices(IProcessQueries queryProcessor)
        {
            QueryProcessor = queryProcessor;
        }

        public IProcessQueries QueryProcessor { get; private set; }
    }

    public partial class ActivityIndexController : Controller
    {
        private readonly ActivityIndexServices _services;

        public ActivityIndexController(ActivityIndexServices services)
        {
            _services = services;
        }

        [HttpGet]
        public virtual RedirectToRouteResult Get()
        {
            //var tenantUrl = HttpContext.SkinCookie();
            var tenantUrl = "www.uc.edu";

            // check username
            if (!string.IsNullOrWhiteSpace(User.Identity.Name))
            {
                var tenant = _services.QueryProcessor.Execute(
                    new EstablishmentByEmail(User.Identity.Name));
                if (tenant != null)
                {
                    //if (string.IsNullOrWhiteSpace(tenantUrl))
                    //    return RedirectToAction(MVC.Common.Skins.Change(tenant.WebsiteUrl, Url.Action(MVC.ActivitiesDeprecated.ActivitySearch.Get(tenant.WebsiteUrl))));
                    return RedirectToAction(MVC.ActivitiesDeprecated.ActivitySearch.Get(tenant.WebsiteUrl));
                }
            }

            // check skin cookie
            //if (tenantUrl != null)
                return RedirectToAction(MVC.ActivitiesDeprecated.ActivitySearch.Get(tenantUrl));

            //return RedirectToAction(MVC.Common.Features.Requirements("faculty-staff"));
        }
    }

    //public static class ActivityIndexRouter
    //{
    //    private static readonly string Area = MVC.Activities.Name;
    //    private static readonly string Controller = MVC.Activities.ActivityIndex.Name;

    //    public class GetRoute : MvcRoute
    //    {
    //        public GetRoute()
    //        {
    //            Url = "faculty-staff";
    //            DataTokens = new RouteValueDictionary(new { area = Area });
    //            Defaults = new RouteValueDictionary(new
    //            {
    //                controller = Controller,
    //                action = MVC.Activities.ActivityIndex.ActionNames.Get,
    //            });
    //            Constraints = new RouteValueDictionary(new
    //            {
    //                httpMethod = new HttpMethodConstraint("GET"),
    //            });
    //        }
    //    }
    //}
}
