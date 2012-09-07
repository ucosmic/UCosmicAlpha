using SimpleInjector;

namespace UCosmic.Configuration
{
    public static class SimpleInjectorConfigurationManagerRegistration
    {
         public static void RegisterConfigurationManager(this Container container)
         {
             container.Register<IManageConfigurations, DotNetConfigurationManager>();
         }
    }
}