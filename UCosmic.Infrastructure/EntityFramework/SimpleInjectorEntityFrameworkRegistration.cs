#if AZURE
#define BROWNFIELD
#undef GREENFIELD_CHANGES
#undef GREENFIELD_INIT
#undef SEED_SQL
#undef SEED_ENTITIES
// DO NOT MODIFY THE LINES ABOVE

#elif DEBUG
#define GREENFIELD_CHANGES // uncomment this line to drop & create db only when the schema changes
//#define GREENFIELD_ALWAYS // uncomment this line to drop & create db on every build
//#define BROWNFIELD // uncomment this line to prevent db from being dropped & recreated
#define SEED_SQL // uncomment this line to seed the database using SQL commands (faster)
//#define SEED_ENTITIES // uncomment this line to seed the database using C# command invocations (slower)
#endif

using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Web;
using SimpleInjector;
using UCosmic.SeedData;

namespace UCosmic.EntityFramework
{
    public static class SimpleInjectorEntityFrameworkRegistration
    {
        public static void RegisterEntityFramework(this Container container)
        {
            container.RegisterDbInitializer();
            container.RegisterDbSeeder();
            container.RegisterDbContext();

            // DbContext interfaces
            container.Register<IUnitOfWork>(container.GetInstance<UCosmicContext>);
            container.Register<IQueryEntities>(container.GetInstance<UCosmicContext>);
            container.Register<ICommandEntities>(container.GetInstance<UCosmicContext>);
        }

        private static void RegisterDbInitializer(this Container container)
        {
            // Db Optimizer (for extra indices, statistics, etc)
#if GREENFIELD_CHANGES || GREENFIELD_ALWAYS
            container.Register<IOptimizeDatabase, SqlDatabaseOptimizer>();
#endif

            // DbInitializer (define compilation symbol at top of file to target different initializers)
#if BROWNFIELD || AZURE || !DEBUG
            container.Register<IDatabaseInitializer<UCosmicContext>, DoNotDropCreateUpdateOrMigrateDb<UCosmicContext>>();
#elif GREENFIELD_CHANGES
            container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnModelChange>();
#elif GREENFIELD_ALWAYS
            container.Register<IDatabaseInitializer<UCosmicContext>, DropCreateDbOnEveryBuild>();
#endif
            container.RegisterInitializer<UCosmicContext>(container.InjectProperties);
        }

        private static void RegisterDbSeeder(this Container container)
        {
#if SEED_SQL
            container.Register<ISeedData, CompositeSqlSeeder>();
#elif SEED_ENTITIES
            container.Register<ISeedData, CompositeEntitySeeder>();
#else
            container.Register<ISeedData, BrownfieldSeeder>();
#endif
        }

        private static void RegisterDbContext(this Container container)
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
        }
    }
}
