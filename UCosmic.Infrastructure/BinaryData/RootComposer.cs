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
                container.Register<IStoreBinaryData>(() => new AzureBlobBinaryDataStorage(ConnectionStringName.UCosmicCloudData.ToString()));

            else
                container.Register<IStoreBinaryData>(() => new IisFileSystemBinaryDataStorage("~/App_Data/binary-data"));

        }
    }
}
