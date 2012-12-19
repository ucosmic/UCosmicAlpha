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
            // Db Optimizer (for extra indices, statistics, etc)
#if DEBUG
            container.Register<IOptimizeDatabase, SqlDatabaseOptimizer>();
#endif

            // DbInitializer (change this to drop & recreate the database, but then change it back)
#if DEBUG
            //container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnModelChange>();
            //container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnEveryBuild>();
            container.Register<IDatabaseInitializer<UCosmicContext>, DoNotDropCreateUpdateOrMigrateDb<UCosmicContext>>();
#else
            container.Register<IDatabaseInitializer<UCosmicContext>, DoNotDropCreateUpdateOrMigrateDb<UCosmicContext>>();
#endif
            container.RegisterInitializer<UCosmicContext>(container.InjectProperties);

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

        }
    }
}
