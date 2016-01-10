using System.Reflection;
using FluentValidation;
using SimpleInjector;
using SimpleInjector.Extensions;
using System.Text;
using System.IO;
using System;

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
            try
            {
                //The code that causes the error goes here.
                container.RegisterManyForOpenGeneric(typeof(IValidator<>), assemblies);
            }
            catch (ReflectionTypeLoadException ex)
            {
                StringBuilder sb = new StringBuilder();
                foreach (Exception exSub in ex.LoaderExceptions)
                {
                    sb.AppendLine(exSub.Message);
                    FileNotFoundException exFileNotFound = exSub as FileNotFoundException;
                    if (exFileNotFound != null)
                    {
                        if (!string.IsNullOrEmpty(exFileNotFound.FusionLog))
                        {
                            sb.AppendLine("Fusion Log:");
                            sb.AppendLine(exFileNotFound.FusionLog);
                        }
                    }
                    sb.AppendLine();
                }
                string errorMessage = sb.ToString();
                //Display or log the error based on your application.
            }
            // add unregistered type resolution for objects missing an IValidator<T>
            container.RegisterSingleOpenGeneric(
                typeof(IValidator<>),
                typeof(UnspecifiedValidator<>)
            );
        }
    }
}
