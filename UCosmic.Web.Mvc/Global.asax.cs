using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using UCosmic.Domain;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            IocConfig.RegisterDependencies();

            AreaRegistration.RegisterAllAreas();

            WebApiConfig.RegisterApi(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            AutoMapperConfig.RegisterProfiles();
            DependencyResolver.Current.GetService<IProcessEvents>().Raise(new ApplicationStarted());
        }

        protected void Session_Start()
        {
            /* Set the anchor link text to the employee personal info controller. */
            if (!string.IsNullOrEmpty(User.Identity.Name))
            {
                var queryProcessor = DependencyResolver.Current.GetService<IProcessQueries>();

                EmployeeModuleSettings employeeModuleSettings = queryProcessor.Execute(
                    new RootEmployeeModuleSettingsByUserName(User.Identity.Name));

                Session["PersonalInfoAnchorText"] = employeeModuleSettings.PersonalInfoAnchorText;                
            }
        }
    }
}