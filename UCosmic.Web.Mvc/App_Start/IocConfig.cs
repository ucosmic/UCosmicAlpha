using System;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;
using FluentValidation.Mvc;
using SimpleInjector;
using SimpleInjector.Integration.Web.Mvc;
using UCosmic.CompositionRoot;
using UCosmic.FluentValidation;
using UCosmic.SeedData;
using UCosmic.WebApi;
using UCosmic.Work;

namespace UCosmic.Web.Mvc
{
    public static class IocConfig
    {
        /// <summary>Initialize the container and register it as MVC3 Dependency Resolver.</summary>
        public static void RegisterDependencies()
        {
            // compose the root
            var container = new Container(
                new ContainerOptions
                {
                    AllowOverridingRegistrations = true,
                });

            var rootCompositionSettings = new RootCompositionSettings
            {
                Flags = RootCompositionFlags.Web |
                        RootCompositionFlags.Work,
                FluentValidationAssemblies = new[]
                {
                    Assembly.GetAssembly(typeof(IHandleCommands<>)),
                    Assembly.GetExecutingAssembly(),
                }
            };
            container.ComposeRoot(rootCompositionSettings);

            container.RegisterMvcControllers(Assembly.GetExecutingAssembly());
            container.RegisterMvcAttributeFilterProvider();
            container.RegisterHttpFilterProvider();

            container.Verify();

            DependencyResolver.SetResolver(new SimpleInjectorDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new SimpleInjectorHttpDependencyResolver(container);

            FluentValidationModelValidatorProvider.Configure(
                provider =>
                {
                    provider.ValidatorFactory = new FluentValidationValidatorFactory(container);
                    provider.AddImplicitRequiredValidator = false;
                }
            );

            // seed data
            if (rootCompositionSettings.Flags.HasFlag(RootCompositionFlags.Debug))
            {
                var seeder = container.GetInstance<ISeedData>();
                if (seeder != null) seeder.Seed();
            }

            // fire up poor man's worker role
            if (rootCompositionSettings.Flags.HasFlag(RootCompositionFlags.Work) &&
                rootCompositionSettings.Flags.HasFlag(RootCompositionFlags.Debug) &&
                !rootCompositionSettings.Flags.HasFlag(RootCompositionFlags.Azure))
            {
                var cancellationTokenSource = new CancellationTokenSource();
                var cancellationToken = cancellationTokenSource.Token;
                Task.Factory.StartNew(() =>
                {
                    var workerRole = DependencyResolver.Current.GetService<WebDevelopmentWorkerRole>();
                    workerRole.OnStart();
                    workerRole.Run(cancellationToken);
                }, cancellationToken);

                AppDomain.CurrentDomain.DomainUnload += (sender, args) => cancellationTokenSource.Cancel();
            }
        }
    }
}