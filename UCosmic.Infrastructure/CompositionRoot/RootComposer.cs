using System;
using System.Linq;
using SimpleInjector;
using UCosmic.BinaryData;
using UCosmic.Cache;
using UCosmic.Configuration;
using UCosmic.Cqrs;
using UCosmic.EntityFramework;
using UCosmic.FluentValidation;
using UCosmic.Logging;
using UCosmic.Mail;
using UCosmic.Saml;
using UCosmic.Security;
using UCosmic.WebApi;
using UCosmic.Work;

namespace UCosmic.CompositionRoot
{
    public static class RootComposer
    {
        public static void ComposeRoot(this Container container, RootCompositionSettings settings)
        {
            if (container == null) throw new ArgumentNullException("container");
            if (settings == null) throw new ArgumentNullException("settings");

#if DEBUG
            settings.Flags |= RootCompositionFlags.Debug;
#endif

#if AZURE
            settings.Flags |= RootCompositionFlags.Azure;
#endif

            container.RegisterMemberAuthentication();
            container.RegisterSaml();

            container.RegisterConfigurationManager();

            container.RegisterMailDelivery();
            container.RegisterHttpConsumer();
            container.RegisterNGeo(settings);

            container.RegisterExceptionLogger();

            container.RegisterBinaryDataStorage(settings);
            container.RegisterEntityFramework();

            container.RegisterFluentValidation(settings);
            container.RegisterQueryProcessing();
            container.RegisterEventProcessing();
            container.RegisterCommandHandling();

            container.RegisterCacheProvider(settings);
            container.RegisterViewManagement();

            container.RegisterWorkScheduling(settings);

            if (settings.Flags.HasFlag(RootCompositionFlags.Web))
            {
                if (settings.MvcAssemblies != null && settings.MvcAssemblies.Any())
                    container.RegisterMvcControllers(settings.MvcAssemblies.ToArray());
                container.RegisterMvcAttributeFilterProvider();
                container.RegisterHttpFilterProvider();
            }

            if (settings.Flags.HasFlag(RootCompositionFlags.Verify))
                container.Verify();
        }
    }
}
