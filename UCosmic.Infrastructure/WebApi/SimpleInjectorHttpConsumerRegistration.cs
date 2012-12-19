using SimpleInjector;

namespace UCosmic.WebApi
{
    public static class SimpleInjectorHttpConsumerRegistration
    {
        public static void RegisterHttpConsumer(this Container container)
        {
            container.Register<IConsumeHttp, WebRequestHttpConsumer>();
        }
    }
}
