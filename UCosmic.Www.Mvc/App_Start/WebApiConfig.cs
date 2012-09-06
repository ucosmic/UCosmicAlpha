using System.Web.Http;

namespace UCosmicLayout3
{
    public static class WebApiConfig
    {
        public static void RegisterApi(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(null,
                "api/{controller}/{id}",
                new
                {
                    id = RouteParameter.Optional
                }
            );
        }
    }
}
