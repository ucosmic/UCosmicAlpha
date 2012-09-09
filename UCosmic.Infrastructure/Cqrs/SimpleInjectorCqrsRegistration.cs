using System.Collections.Generic;
using System.Reflection;
using SimpleInjector;
using SimpleInjector.Extensions;

namespace UCosmic.Cqrs
{
    public static class SimpleInjectorCqrsRegistration
    {
        public static void RegisterQueryProcessor(this Container container, params Assembly[] assemblies)
        {
            container.RegisterQueryProcessor(assemblies as IEnumerable<Assembly>);
        }

        public static void RegisterQueryProcessor(this Container container, IEnumerable<Assembly> assemblies)
        {
            container.RegisterSingle<SimpleInjectorQueryProcessor>();
            container.Register<IProcessQueries>(container.GetInstance<SimpleInjectorQueryProcessor>);
            container.RegisterManyForOpenGeneric(typeof(IHandleQueries<,>), assemblies);
        }
    }
}
