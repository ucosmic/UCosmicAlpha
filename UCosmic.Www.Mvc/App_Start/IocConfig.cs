using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Reflection;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using SimpleInjector;
using SimpleInjector.Integration.Web.Mvc;
using UCosmic.EntityFramework;

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

            // Using Entity Framework? Please read this: http://simpleinjector.codeplex.com/discussions/363935
            container.Verify();

            DependencyResolver.SetResolver(new SimpleInjectorDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new HttpDependencyResolver(container);
        }

        private static void InitializeContainer(Container container)
        {
            RegisterEntityFramework(container);
        }

        private static void RegisterEntityFramework(Container container)
        {
            // DbContext lifetime
            container.RegisterPerWebRequest<DbContext, UCosmicContext>();
            container.RegisterLifetimeScope<IObjectContextAdapter, UCosmicContext>();
            container.Register(() =>
            {
                if (HttpContext.Current != null)
                    return (UCosmicContext)container.GetInstance<DbContext>();
                return (UCosmicContext)container.GetInstance<IObjectContextAdapter>();
            });

            // DbContext interfaces
            container.Register<IUnitOfWork>(container.GetInstance<UCosmicContext>);
            container.Register<IQueryEntities>(container.GetInstance<UCosmicContext>);
            container.Register<ICommandEntities>(container.GetInstance<UCosmicContext>);

            // DbInitializer
            container.Register<IDatabaseInitializer<UCosmicContext>, BrownfieldDatabaseInitializer<UCosmicContext>>();
            container.RegisterInitializer<UCosmicContext>(container.InjectProperties);
        }
    }
}