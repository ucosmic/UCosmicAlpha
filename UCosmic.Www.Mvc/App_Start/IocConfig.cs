using System.Reflection;
using System.Web.Http;
using System.Web.Mvc;
using SimpleInjector;
using SimpleInjector.Integration.Web.Mvc;
using UCosmic.Cache;
using UCosmic.Configuration;
using UCosmic.EntityFramework;
using UCosmic.Ioc;
using UCosmic.Logging;

namespace UCosmic.Www.Mvc
{
    public static class IocConfig
    {
        /// <summary>Initialize the container and register it as MVC3 Dependency Resolver.</summary>
        public static void RegisterDependencies()
        {
            var container = new Container();

            InitializeContainer(container);

            container.RegisterMvcControllers(Assembly.GetExecutingAssembly());

            container.RegisterMvcAttributeFilterProvider();
            container.RegisterHttpFilterProvider();

            // Using Entity Framework? Please read this: http://simpleinjector.codeplex.com/discussions/363935
            container.Verify();

            DependencyResolver.SetResolver(new SimpleInjectorDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new SimpleInjectorHttpDependencyResolver(container);
        }

        private static void InitializeContainer(Container container)
        {
            container.RegisterConfigurationManager();
            container.RegisterElmahExceptionLogger();
            container.RegisterEntityFramework();
            container.TryRegisterAzureCacheProvider();
        }
    }
}