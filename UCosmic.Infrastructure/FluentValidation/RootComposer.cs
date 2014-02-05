using System.Reflection;
using FluentValidation;
using SimpleInjector;
using SimpleInjector.Extensions;

namespace UCosmic.FluentValidation
{
    internal static class RootComposer
    {
        internal static void RegisterFluentValidation(this Container container, params Assembly[] assemblies)
        {
            // by default, stop validation after first failure
            ValidatorOptions.CascadeMode = CascadeMode.StopOnFirstFailure;

            // merge domain with settings assemblies to register validators
            assemblies = assemblies ?? new[] { Assembly.GetAssembly(typeof(IHandleCommands<>)) };

            // register validation processor
            container.RegisterSingle<IProcessValidation, ValidationProcessor>();

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
