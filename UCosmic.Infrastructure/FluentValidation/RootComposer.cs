using System.Reflection;
using FluentValidation;
using SimpleInjector;
using SimpleInjector.Extensions;
using UCosmic.CompositionRoot;

namespace UCosmic.FluentValidation
{
    internal static class RootComposer
    {
        internal static void RegisterFluentValidation(this Container container, RootCompositionSettings settings)
        {
            // by default, stop validation after first failure
            ValidatorOptions.CascadeMode = CascadeMode.StopOnFirstFailure;

            // merge domain with settings assemblies to register validators
            var assemblies = new[] { Assembly.GetAssembly(typeof(IHandleCommands<>)) };

            // fluent validation open generics
            container.RegisterManyForOpenGeneric(typeof(IValidator<>), assemblies);

            // add unregistered type resolution for objects missing an IValidator<T>
            container.RegisterSingleOpenGeneric(
                typeof(IValidator<>),
                typeof(UnspecifiedValidator<>)
            );
        }
    }
}
