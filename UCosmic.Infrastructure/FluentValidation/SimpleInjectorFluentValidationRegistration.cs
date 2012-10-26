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
            ValidatorOptions.CascadeMode = CascadeMode.StopOnFirstFailure;
            container.RegisterManyForOpenGeneric(typeof(IValidator<>), assemblies);
        }
    }
}
