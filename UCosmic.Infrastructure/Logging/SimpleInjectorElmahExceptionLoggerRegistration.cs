using SimpleInjector;

namespace UCosmic.Logging
{
    public static class SimpleInjectorElmahExceptionLoggerRegistration
    {
        public static void RegisterElmahExceptionLogger(this Container container)
        {
            container.Register<ILogExceptions>(() =>
            {
                var config = container.GetInstance<IManageConfigurations>();
                return new ElmahExceptionLogger(config.DefaultMailFromAddress, config.EmergencyMailAddress);
            });
        }
    }
}