using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using SimpleInjector;

namespace UCosmic.Ioc
{
    public class SimpleInjectorHttpFilterProvider : IFilterProvider
    {
        private readonly Container _container;

        public SimpleInjectorHttpFilterProvider(Container container)
        {
            _container = container;
        }

        public IEnumerable<FilterInfo> GetFilters(HttpConfiguration configuration, HttpActionDescriptor actionDescriptor)
        {
            if (configuration == null) throw new ArgumentNullException("configuration");
            if (actionDescriptor == null) throw new ArgumentNullException("actionDescriptor");

            var configFilters = configuration.Filters;
            foreach (var configFilter in configFilters)
                _container.InjectProperties(configFilter);

            var controllerFilters = actionDescriptor.ControllerDescriptor.GetFilters().Select(instance =>
            {
                _container.InjectProperties(instance);
                return new FilterInfo(instance, FilterScope.Controller);
            });
            var actionFilters = actionDescriptor.GetFilters().Select(instance =>
            {
                _container.InjectProperties(instance);
                return new FilterInfo(instance, FilterScope.Action);
            });

            return configFilters.Concat(controllerFilters).Concat(actionFilters);
        }
    }
}