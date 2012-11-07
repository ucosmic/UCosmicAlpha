using SimpleInjector;

namespace UCosmic.Security
{
    public static class SimpleInjectorSecurityRegistration
    {
        public static void RegisterMemberAuthentication(this Container container)
        {
            container.Register<IStorePasswords, DotNetMembershipProvider>();
            container.Register<ISignUsers, DotNetFormsAuthentication>();
        }
    }
}
