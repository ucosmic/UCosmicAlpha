using SimpleInjector;

namespace UCosmic.Saml
{
    internal static class RootComposer
    {
        internal static void RegisterSaml(this Container container)
        {
            container.Register<IProvideSaml2Service, ComponentSpaceSaml2ServiceProvider>();
            container.Register<IParseSaml2Metadata, ComponentSpaceSaml2MetadataParser>();
            container.Register<IStoreSamlCertificates, RealSamlCertificateStorage>();
        }
    }
}
