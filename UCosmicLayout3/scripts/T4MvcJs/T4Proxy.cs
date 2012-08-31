using System;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using UCosmicLayout3;

namespace T4MvcJs
{
    public class T4Proxy
    {
        public static RouteCollection GetRoutes()
        {
            var routes = new RouteCollection();
            RouteConfig.RegisterRoutes(routes);

            RegisterAreaRoutes(routes);


            return routes;
        }

        private static void RegisterAreaRoutes(RouteCollection routes)
        {
            var areaTypes = Assembly.GetAssembly(typeof(T4Proxy)).GetTypes().Where(x => x.IsSubclassOf(typeof(AreaRegistration)));
            foreach (var areaType in areaTypes)
            {
                var area = Activator.CreateInstance(areaType) as AreaRegistration;
                if (area == null)
                    continue;

                var context = new AreaRegistrationContext(area.AreaName, routes);
                area.RegisterArea(context);
            }
        }
    }
}