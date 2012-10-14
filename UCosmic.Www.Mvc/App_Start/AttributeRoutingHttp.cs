//using System.Reflection;
//using System.Web.Http;
//using AttributeRouting.Web.Http.WebHost;

//[assembly: WebActivator.PreApplicationStartMethod(typeof(UCosmic.Www.Mvc.AttributeRoutingHttp), "Start")]

//namespace UCosmic.Www.Mvc {
//    public static class AttributeRoutingHttp {
//        public static void RegisterRoutes(HttpRouteCollection routes) {
            
//            // See http://github.com/mccalltd/AttributeRouting/wiki for more options.
//            // To debug routes locally using the built in ASP.NET development server, go to /routes.axd

//            routes.MapHttpAttributeRoutes(config =>
//            {
//                config.AddRoutesFromAssembly(Assembly.GetExecutingAssembly());
//                config.UseLowercaseRoutes = true;
//            });
//        }

//        public static void Start() {
//            RegisterRoutes(GlobalConfiguration.Configuration.Routes);
//        }
//    }
//}
