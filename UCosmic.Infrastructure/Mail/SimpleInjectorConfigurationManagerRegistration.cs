using SimpleInjector;

namespace UCosmic.Mail
{
    public static class SimpleInjectorMailSenderRegistration
    {
         public static void RegisterMailSender(this Container container)
         {
             container.Register<ISendMail, SmtpMailSender>();
         }
    }
}