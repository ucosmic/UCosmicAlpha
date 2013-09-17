using System.Configuration;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Filters;
using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
using NGeo.Yahoo.PlaceFinder;
using SimpleInjector;
using UCosmic.CompositionRoot;
using UCosmic.Configuration;

namespace UCosmic.WebApi
{
    internal static class RootComposer
    {
        internal static void RegisterHttpConsumer(this Container container)
        {
            container.Register<IConsumeHttp, WebClientHttpConsumer>();
        }

        internal static void RegisterNGeo(this Container container, RootCompositionSettings settings)
        {
            container.RegisterPerWebRequest<IConsumeGeoNames, GeoNamesClient>();
            container.RegisterPerWebRequest<IContainGeoNames>(() => 
                new GeoNamesContainer(ConfigurationManager.AppSettings[AppSettingsKey.GeoNamesUserName.ToString()])
            );

            container.RegisterPerWebRequest<IConsumeGeoPlanet, GeoPlanetClient>();
            container.RegisterPerWebRequest<IContainGeoPlanet>(() => 
                new GeoPlanetContainer(ConfigurationManager.AppSettings[AppSettingsKey.GeoPlanetAppId.ToString()])
            );

            // in release mode, register the placefinder consumer key & secret
            if (settings.Flags.HasFlag(RootCompositionFlags.Debug)) return;

            container.RegisterPerWebRequest<IConsumePlaceFinder, PlaceFinderClient>();
            container.RegisterPerWebRequest<IContainPlaceFinder>(() => 
                new PlaceFinderContainer(
                    ConfigurationManager.AppSettings[AppSettingsKey.PlaceFinderConsumerKey.ToString()],
                    ConfigurationManager.AppSettings[AppSettingsKey.PlaceFinderConsumerSecret.ToString()]
                )
            );
        }

        internal static void RegisterHttpFilterProvider(this Container container)
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
