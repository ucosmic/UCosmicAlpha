using System.Web.Mvc;
using System.Web.Routing;
using LowercaseRoutesMVC4;

namespace UCosmicLayout3
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // TODO: move to route sniffer
            routes.MapRouteLowercase(null,
                "as/{id}", new
                {
                    controller = MVC.Tenancy.Name,
                    action = MVC.Tenancy.ActionNames.Tenant,
                    id = UrlParameter.Optional,
                });

            routes.MapRouteLowercase(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}