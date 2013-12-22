using System.Reflection;
using Microsoft.WindowsAzure;
using SimpleInjector;
using SimpleInjector.Extensions;
using UCosmic.CompositionRoot;
using UCosmic.Configuration;

namespace UCosmic.Work
{
    internal static class RootComposer
    {
        internal static void RegisterWorkScheduling(this Container container, RootCompositionSettings settings)
        {
            if (!settings.Flags.HasFlag(RootCompositionFlags.Work)) return;

            var assemblies = new[] { Assembly.GetAssembly(typeof(IPerformWork<>)) };

            // register the work scheduler
            if (settings.Flags.HasFlag(RootCompositionFlags.Azure))
                container.RegisterSingle<IScheduleWork>(() =>
                    new AzureBlobWorkScheduler(CloudConfigurationManager.GetSetting(AppSettingsKey.AzureStorageData.ToString())));

            else if (settings.Flags.HasFlag(RootCompositionFlags.Web))
                container.RegisterSingle<IScheduleWork>(() => new WebDevelopmentWorkScheduler());

            // register the work performers
            container.RegisterManyForOpenGeneric(typeof(IPerformWork<>), container.RegisterAll, assemblies);

            // retry job on certain exceptions
            container.RegisterDecorator(
                typeof(IPerformWork<>),
                typeof(RetryWorkDecorator<>)
            );

            // wrap the actual performer in another new task (begins new lifetime scope)
            container.RegisterSingleDecorator(
                typeof(IPerformWork<>),
                typeof(PerformWorkAsynchronouslyDecorator<>)
            );

            // decorate the performers with scheduler singletons
            container.RegisterSingleDecorator(
                typeof(IPerformWork<>),
                typeof(PerformWorkOnScheduleDecorator<>)
            );
        }
    }
}
