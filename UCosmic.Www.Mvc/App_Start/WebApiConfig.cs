using System.Reflection;
using System.Web.Http;
using AttributeRouting.Web.Http.WebHost;
using Newtonsoft.Json.Serialization;

namespace UCosmic.Www.Mvc
{
    public static class WebApiConfig
    {
        public static void RegisterApi(HttpConfiguration config)
        {
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            config.Routes.MapHttpAttributeRoutes(cfg =>
            {
                cfg.AddRoutesFromAssembly(Assembly.GetExecutingAssembly());
                cfg.UseLowercaseRoutes = true;
            });

            //var exp = config.Services.GetApiExplorer();
            //var desc = exp.ApiDescriptions;

            //config.Routes.MapHttpRoute(null,
            //    "api/{controller}/{id}",
            //    new
            //    {
            //        id = RouteParameter.Optional
            //    }
            //);
        }
    }
}
