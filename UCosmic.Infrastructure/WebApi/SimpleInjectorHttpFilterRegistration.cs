using System.Linq;
using System.Web.Http;
using System.Web.Http.Filters;
using SimpleInjector;

namespace UCosmic.WebApi
{
    public static class SimpleInjectorHttpFilterRegistration
    {
        public static void RegisterHttpFilterProvider(this Container container)
        {
            var httpFilterProvider = new SimpleInjectorHttpFilterProvider(container);
            container.RegisterSingle<IFilterProvider>(httpFilterProvider);
            var configServices = GlobalConfiguration.Configuration.Services;
            configServices.GetFilterProviders().ToList().ForEach(filterProvider =>
                configServices.Remove(typeof(IFilterProvider), filterProvider));
            configServices.Add(typeof(IFilterProvider), httpFilterProvider);
        }
    }
}
