using System.Reflection;
using Microsoft.WindowsAzure;
using SimpleInjector;
using SimpleInjector.Extensions;
using UCosmic.Configuration;

namespace UCosmic.Lucene
{
    internal static class RootComposer
    {
        internal static void RegisterLucene(this Container container)
        {
            container.RegisterSingle<IStoreDocumentIndexes>(() =>
                new AzureDirectoryStore(CloudConfigurationManager.GetSetting(AppSettingsKey.AzureStorageData.ToString())));
            //container.RegisterSingleOpenGeneric(typeof(IStoreDocuments<>), typeof(AzureDirectoryStore<>));
            //container.RegisterSingleOpenGeneric(typeof(IStoreDocuments<,>), typeof(AzureDirectoryStore<,>));

            container.RegisterManyForOpenGeneric(typeof(IIndexDocuments<>), Assembly.GetAssembly(typeof(IIndexDocuments<>)));

            container.RegisterSingle<IProvideDocumentSearchers, SearcherManager>();
        }
    }
}
