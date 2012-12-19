using System;
using System.Collections.Generic;
using System.Web.Http.Dependencies;
using SimpleInjector;

namespace UCosmic.WebApi
{
    public class SimpleInjectorHttpDependencyResolver : IDependencyResolver
    {
        private readonly Container _container;

        public SimpleInjectorHttpDependencyResolver(Container container)
        {
            if (container == null) throw new ArgumentNullException("container");
            _container = container;
        }

        public IDependencyScope BeginScope()
        {
            // This example does not support child scopes, so we simply return 'this'.
            return this; 
        }

        public void Dispose()
        {
            // When BeginScope returns 'this', the Dispose method must be a no-op.
        }

        public object GetService(Type serviceType)
        {
            return ((IServiceProvider) _container).GetService(serviceType);
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return _container.GetAllInstances(serviceType);
        }
    }
}
