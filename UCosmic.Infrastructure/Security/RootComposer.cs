using SimpleInjector;

namespace UCosmic.Security
{
    internal static class RootComposer
    {
        internal static void RegisterMemberAuthentication(this Container container)
        {
            container.Register<IStorePasswords, DotNetMembershipProvider>();
            container.Register<ISignUsers, DotNetFormsAuthentication>();
        }
    }
}
