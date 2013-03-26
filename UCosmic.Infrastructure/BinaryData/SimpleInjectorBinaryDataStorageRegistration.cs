using System.Configuration;
using SimpleInjector;
using UCosmic.Configuration;

namespace UCosmic.BinaryData
{
    public static class SimpleInjectorBinaryDataStorageRegistration
    {
        public static void RegisterBinaryDataStorage(this Container container)
        {
#if AZURE
            container.Register<IStoreBinaryData>(() => new AzureBlobBinaryDataStorage(ConnectionStringKey.UCosmicCloudData.ToString()));
#else
            // register azure if connection string is set up to point to development storage
            var connectionString = ConfigurationManager.ConnectionStrings[ConnectionStringKey.UCosmicCloudData.ToString()];
            if (connectionString != null && connectionString.ConnectionString == "UseDevelopmentStorage=true")
                container.Register<IStoreBinaryData>(() => new AzureBlobBinaryDataStorage(ConnectionStringKey.UCosmicCloudData.ToString()));

            else
                container.Register<IStoreBinaryData>(() => new IisFileSystemBinaryDataStorage("~/App_Data/binary-data"));
#endif
        }
    }
}
