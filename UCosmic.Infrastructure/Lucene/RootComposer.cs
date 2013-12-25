using System.Reflection;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.ServiceRuntime;
using SimpleInjector;
using SimpleInjector.Extensions;
using UCosmic.Configuration;

namespace UCosmic.Lucene
{
    internal static class RootComposer
    {
        internal static void RegisterLucene(this Container container)
        {
            if (RoleEnvironment.IsAvailable)
                container.RegisterSingle<IStoreDocumentIndexes>(() =>
                    new AzureDirectoryStore(CloudConfigurationManager.GetSetting(AppSettingsKey.AzureStorageData.ToString())));
            else
                container.Register<IStoreDocumentIndexes>(() => new IisFileSystemDirectoryStore("~/App_Data/lucene"));

            container.RegisterManyForOpenGeneric(typeof(IIndexDocuments<>), Assembly.GetAssembly(typeof(IIndexDocuments<>)));

            container.RegisterSingle<IProvideDocumentSearchers, SearcherManager>();
        }
    }
}
