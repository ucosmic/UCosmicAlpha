using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
#if AZURE
using NGeo.Yahoo.PlaceFinder;
#endif
using SimpleInjector;

namespace UCosmic.WebApi
{
    public static class SimpleInjectorNGeoRegistration
    {
        public static void RegisterNGeo(this Container container, string geoNamesUserName, string geoPlanetAppId,
            string placeFinderConsumerKey, string placeFinderConsumerSecret)
        {
            container.RegisterPerWebRequest<IConsumeGeoNames, GeoNamesClient>();
            container.RegisterPerWebRequest<IContainGeoNames>(() => new GeoNamesContainer(geoNamesUserName));
            container.RegisterPerWebRequest<IConsumeGeoPlanet, GeoPlanetClient>();
            container.RegisterPerWebRequest<IContainGeoPlanet>(() => new GeoPlanetContainer(geoPlanetAppId));

#if AZURE
            container.RegisterPerWebRequest<IConsumePlaceFinder, PlaceFinderClient>();
            container.RegisterPerWebRequest<IContainPlaceFinder>(() => new PlaceFinderContainer(placeFinderConsumerKey, placeFinderConsumerSecret));
#endif
        }
    }
}
