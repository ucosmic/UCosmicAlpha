using SimpleInjector;

namespace UCosmic.Logging
{
    internal static class RootComposer
    {
        internal static void RegisterExceptionLogger(this Container container)
        {
            container.Register<ILogExceptions>(() =>
            {
                var config = container.GetInstance<IManageConfigurations>();
                return new ElmahExceptionLogger(config.DefaultMailFromAddress, config.EmergencyMailAddresses);
            });
        }
    }
}