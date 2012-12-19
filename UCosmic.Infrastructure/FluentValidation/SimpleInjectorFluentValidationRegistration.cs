using System.Reflection;
using FluentValidation;
using SimpleInjector;
using SimpleInjector.Extensions;

namespace UCosmic.FluentValidation
{
    public static class SimpleInjectorFluentValidationRegistration
    {
        public static void RegisterFluentValidation(this Container container, params Assembly[] assemblies)
        {
            // by default, stop validation after first failure
            ValidatorOptions.CascadeMode = CascadeMode.StopOnFirstFailure;

            // fluent validation open generics
            container.RegisterManyForOpenGeneric(typeof(IValidator<>), assemblies);

            // add unregistered type resolution for objects missing an IValidator<T>
            container.RegisterSingleOpenGeneric(typeof(IValidator<>), typeof(UnspecifiedValidator<>));
        }
    }
}
