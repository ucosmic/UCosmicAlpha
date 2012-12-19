#if AZURE
#define BROWNFIELD
#undef GREENFIELD_CHANGES
#undef GREENFIELD_INIT
// DO NOT MODIFY THE LINES ABOVE

#elif DEBUG
#define GREENFIELD_CHANGES // uncomment this line to drop & create db only when the schema changes
//#define GREENFIELD_ALWAYS // uncomment this line to drop & create db on every build
//#define BROWNFIELD // uncomment this line to prevent db from being dropped & recreated
#endif

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
#if GREENFIELD_CHANGES || GREENFIELD_ALWAYS
            container.Register<IOptimizeDatabase, SqlDatabaseOptimizer>();
#endif

            // DbInitializer (define compilation symbol to use different initializers)
#if BROWNFIELD || AZURE || !DEBUG
            container.Register<IDatabaseInitializer<UCosmicContext>, DoNotDropCreateUpdateOrMigrateDb<UCosmicContext>>();
#elif GREENFIELD_CHANGES
            container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnModelChange>();
#elif GREENFIELD_ALWAYS
            container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnEveryBuild>();
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
