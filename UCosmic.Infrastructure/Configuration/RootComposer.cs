using SimpleInjector;

namespace UCosmic.Configuration
{
    internal static class RootComposer
    {
         internal static void RegisterConfigurationManager(this Container container)
         {
             container.Register<IManageConfigurations, DotNetConfigurationManager>();
         }
    }
}