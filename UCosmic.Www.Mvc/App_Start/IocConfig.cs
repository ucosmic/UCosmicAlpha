using System.Reflection;
using System.Web.Http;
using System.Web.Mvc;
using SimpleInjector;
using SimpleInjector.Integration.Web.Mvc;
using UCosmic.Configuration;
using UCosmic.Cqrs;
using UCosmic.EntityFramework;
using UCosmic.FluentValidation;
using UCosmic.Ioc;
using UCosmic.Logging;
using UCosmic.Security;

namespace UCosmic.Web.Mvc
{
    public static class IocConfig
    {
        /// <summary>Initialize the container and register it as MVC3 Dependency Resolver.</summary>
        public static void RegisterDependencies()
        {
            var container = new Container(
                new ContainerOptions
                {
                    AllowOverridingRegistrations = true,
                });

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
            container.RegisterMemberAuthentication();
            container.RegisterConfigurationManager();
            container.RegisterElmahExceptionLogger();
            container.RegisterEntityFramework();
            container.RegisterFluentValidation(Assembly.GetAssembly(typeof (IHandleCommands<>)));
            container.RegisterQueryProcessor(Assembly.GetAssembly(typeof(IHandleQueries<,>)));
            container.RegisterEventProcessor(Assembly.GetAssembly(typeof(IHandleEvents<>)));
            container.RegisterCommandHandlers(Assembly.GetAssembly(typeof(IHandleCommands<>)));
            //container.TryRegisterAzureCacheProvider();
            //container.RegisterAzureCacheViewManager();
            //container.RegisterHybridMemoryAzureViewManager();
            container.RegisterMemoryViewManager();
        }
    }
}