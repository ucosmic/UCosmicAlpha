using System.Reflection;
using SimpleInjector;
using SimpleInjector.Extensions;
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
            container.RegisterDecorator(
                typeof(IHandleQueries<,>),
                typeof(FluentValidationQueryDecorator<,>)
            );
        }

        internal static void RegisterEventProcessing(this Container container)
        {
            // events are in the domain project
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleEvents<>)) };

            //container.RegisterSingle<SimpleInjectorSynchronousEventProcessor>();
            //container.Register<IProcessEvents>(container.GetInstance<SimpleInjectorSynchronousEventProcessor>);
            container.RegisterSingle<SimpleInjectorAsynchronousEventProcessor>();
            container.Register<IProcessEvents>(container.GetInstance<SimpleInjectorAsynchronousEventProcessor>);
            container.RegisterManyForOpenGeneric(typeof(IHandleEvents<>), container.RegisterAll, assemblies);
            container.RegisterDecorator(
                typeof(IHandleEvents<>),
                typeof(HandleEventAsynchronouslyDecorator<>)
            );
        }

        internal static void RegisterCommandHandling(this Container container)
        {
            // commands are in the domain project
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleCommands<>)) };

            container.RegisterManyForOpenGeneric(typeof(IHandleCommands<>), assemblies);

            container.RegisterDecorator(
                typeof(IHandleCommands<>),
                typeof(FluentValidationCommandDecorator<>)
            );
        }

        internal static void RegisterViewManagement(this Container container)
        {
            container.Register<IManageViews, UCosmicServices>();
        }
    }
}
