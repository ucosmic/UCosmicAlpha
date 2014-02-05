using System;
using System.Reflection;
using Microsoft.ApplicationServer.Caching;
using SimpleInjector;
using SimpleInjector.Extensions;
using UCosmic.CompositionRoot;
using UCosmic.FluentValidation;

namespace UCosmic.Cqrs
{
    internal static class RootComposer
    {
        internal static void RegisterQueryProcessing(this Container container)
        {
            // queries are in the domain project
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleQueries<,>)) };

            container.RegisterSingle<SimpleInjectorQueryProcessor>();
            container.Register<IProcessQueries>(container.GetInstance<SimpleInjectorQueryProcessor>);
            container.RegisterManyForOpenGeneric(typeof(IHandleQueries<,>), assemblies);

            // retry all queries (after validation)
            container.RegisterDecorator(
                typeof(IHandleQueries<,>),
                typeof(RetryQueryDecorator<,>)
            );

            // validate certain queries (before retry)
            container.RegisterDecorator(
                typeof(IHandleQueries<,>),
                typeof(FluentValidationQueryDecorator<,>)
            );
        }

        internal static void RegisterEventProcessing(this Container container)
        {
            // events are in the domain project
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleEvent<>)) };

            container.RegisterManyForOpenGeneric(typeof(IHandleEvent<>), container.RegisterAll, assemblies);
            container.RegisterDecorator(
                typeof(IHandleEvent<>),
                typeof(HandleEventAsynchronouslyDecorator<>)
            );
            container.RegisterSingleOpenGeneric(typeof(ITriggerEvent<>), typeof(MultipleDispatchEventTrigger<>));
        }

        internal static void RegisterCommandHandling(this Container container)
        {
            // commands are in the domain project
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleCommands<>)) };
            container.RegisterSingle<IProcessCommands, CommandProcessor>();
            container.RegisterManyForOpenGeneric(typeof(IHandleCommands<>), assemblies);

            // retry all commands (after validation)
            container.RegisterDecorator(
                typeof(IHandleCommands<>),
                typeof(RetryCommandDecorator<>)
            );

            // validate commands (before retry)
            container.RegisterDecorator(
                typeof(IHandleCommands<>),
                typeof(FluentValidationCommandDecorator<>)
            );
        }

        internal static void RegisterViewManagement(this Container container, RootCompositionSettings settings)
        {
            if (!settings.Flags.HasFlag(RootCompositionFlags.Debug))
            {
                container.Register<IManageViews>(() => new AzureCacheViewManager(container.GetInstance<DataCache>(), TimeSpan.FromDays(14)));
            }
            else
            {
                container.Register<IManageViews, UCosmicServices>();
            }
        }
    }
}
