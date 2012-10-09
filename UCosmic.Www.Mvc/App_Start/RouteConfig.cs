using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using AttributeRouting.Web.Mvc;
using LowercaseRoutesMVC4;

namespace UCosmic.Www.Mvc
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapAttributeRoutes(config =>
            {
                config.AddRoutesFromAssembly(Assembly.GetExecutingAssembly());
                config.UseLowercaseRoutes = true;
                config.AppendTrailingSlash = true;
            });

            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // TODO: move to route sniffer
            routes.MapRouteLowercase(null,
                "as/{id}", new
                {
                    controller = MVC.Tenancy.Name,
                    action = MVC.Tenancy.ActionNames.Tenant,
                    id = UrlParameter.Optional,
                });

            routes.MapRouteLowercase(null,
                "{controller}/{action}/{id}",
                new
                {
                    controller = "Home", action = "Index", id = UrlParameter.Optional
                }
            );
        }
    }
}