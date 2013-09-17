using SimpleInjector;

namespace UCosmic.Mail
{
    internal static class RootComposer
    {
        internal static void RegisterMailDelivery(this Container container)
         {
             container.Register<ISendMail, SmtpMailSender>();
         }
    }
}