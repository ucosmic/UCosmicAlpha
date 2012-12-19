using SimpleInjector;

namespace UCosmic.Saml
{
    public static class SimpleInjectorSamlRegistration
    {
        public static void RegisterSaml(this Container container)
        {
            container.Register<IProvideSaml2Service, ComponentSpaceSaml2ServiceProvider>();
            container.Register<IParseSaml2Metadata, ComponentSpaceSaml2MetadataParser>();
            container.Register<IStoreSamlCertificates, RealSamlCertificateStorage>();
        }
    }
}
