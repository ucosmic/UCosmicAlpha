using System.Runtime.Caching;
using Microsoft.ApplicationServer.Caching;
using SimpleInjector;
using UCosmic.CompositionRoot;

namespace UCosmic.Cache
{
    internal static class RootComposer
    {
        internal static void RegisterCacheProvider(this Container container, RootCompositionSettings settings)
        {
            if (!settings.Flags.HasFlag(RootCompositionFlags.Debug))
            {
                container.RegisterSingle(() => new DataCacheFactory());
                container.RegisterSingle(() => container.GetInstance<DataCacheFactory>().GetDefaultCache());
                container.Register<IProvideCache>(() => new AzureCacheProvider(container.GetInstance<DataCache>()));
            }
            else
            {
                container.Register<IProvideCache>(() => new ObjectCacheProvider(MemoryCache.Default));
            }
        }
    }
}
