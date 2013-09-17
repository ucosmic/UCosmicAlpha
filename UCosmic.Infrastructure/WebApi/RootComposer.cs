using System.Configuration;
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
    }
}
