using System.Web.Http;
using Newtonsoft.Json.Serialization;

namespace UCosmic.Www.Mvc
{
    public static class WebApiConfig
    {
        public static void RegisterApi(HttpConfiguration config)
        {
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

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
