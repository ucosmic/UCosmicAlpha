using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using UCosmic.Domain;

namespace UCosmic.Web.Mvc
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AutoMapperConfig.RegisterProfiles(); 
            
            IocConfig.RegisterDependencies();

            WebApiConfig.RegisterApi(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            AreaRegistration.RegisterAllAreas();
            MvcHandler.DisableMvcResponseHeader = true;

            DependencyResolver.Current.GetService<IProcessEvents>().Raise(new ApplicationStarted());
        }

        protected void Application_PreSendRequestHeaders(object sender, EventArgs e)
        {
            // Remove the "Server" HTTP Header from response
            var app = sender as HttpApplication;
            if (app == null || app.Context == null) return;

            var headers = app.Context.Response.Headers;
            if (headers["Server"] != null) headers.Remove("Server");
        }
    }
}
