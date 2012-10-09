using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using AttributeRouting.Web.Mvc;

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

            // enforce attribute routing for all actions
            //routes.MapRouteLowercase(null,
            //    "{controller}/{action}/{id}",
            //    new
            //    {
            //        controller = "Home", action = "Index", id = UrlParameter.Optional
            //    }
            //);
        }
    }
}