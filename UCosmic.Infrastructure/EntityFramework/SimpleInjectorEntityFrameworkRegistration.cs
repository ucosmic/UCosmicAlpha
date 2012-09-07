using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Web;
using SimpleInjector;

namespace UCosmic.EntityFramework
{
    public static class SimpleInjectorEntityFrameworkRegistration
    {
        public static void RegisterEntityFramework(this Container container)
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
            container.Register<IDatabaseInitializer<UCosmicContext>, DoNotDropCreateUpdateOrMigrateDatabase<UCosmicContext>>();
            container.RegisterInitializer<UCosmicContext>(container.InjectProperties);
        }
    }
}
