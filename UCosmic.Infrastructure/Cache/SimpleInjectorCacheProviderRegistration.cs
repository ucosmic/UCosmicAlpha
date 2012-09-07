using System;
using Microsoft.ApplicationServer.Caching;
using SimpleInjector;

namespace UCosmic.Cache
{
    public static class SimpleInjectorCacheProviderRegistration
    {
        public static void RegisterAzureCacheProvider(this Container container)
        {
            container.RegisterSingle(() => new DataCacheFactory());
            container.RegisterSingle(() => container.GetInstance<DataCacheFactory>().GetDefaultCache());
            container.Register<IProvideCache>(() => new AzureCacheProvider(container.GetInstance<DataCache>()));
        }

        public static void TryRegisterAzureCacheProvider(this Container container)
        {
            try
            {
                var factory = new DataCacheFactory();
                factory.GetDefaultCache();
                container.RegisterAzureCacheProvider();
            }
            catch (Exception)
            {
                // TODO: log this
            }
        }
    }
}
