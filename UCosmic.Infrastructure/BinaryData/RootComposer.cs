using Microsoft.WindowsAzure;
using SimpleInjector;
using UCosmic.CompositionRoot;
using UCosmic.Configuration;

namespace UCosmic.BinaryData
{
    internal static class RootComposer
    {
        internal static void RegisterBinaryDataStorage(this Container container, RootCompositionSettings settings)
        {
            if (!settings.Flags.HasFlag(RootCompositionFlags.Debug))
                container.Register<IStoreBinaryData>(() =>
                    new AzureBlobBinaryDataStorage(CloudConfigurationManager.GetSetting(AppSettingsKey.AzureStorageData.ToString())));

            else
                container.Register<IStoreBinaryData>(() => new IisFileSystemBinaryDataStorage("~/App_Data/binary-data"));

        }
    }
}
