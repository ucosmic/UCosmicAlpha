using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
using NGeo.Yahoo.PlaceFinder;
using SimpleInjector;

namespace UCosmic.Geography
{
    public static class SimpleInjectorNGeoRegistration
    {
        public static void RegisterNGeo(this Container container, string geoNamesUserName, string geoPlanetAppId)
        {
            container.RegisterPerWebRequest<IConsumeGeoNames, GeoNamesClient>();
            container.RegisterPerWebRequest<IContainGeoNames>(() => new GeoNamesContainer(geoNamesUserName));
            container.RegisterPerWebRequest<IConsumeGeoPlanet, GeoPlanetClient>();
            container.RegisterPerWebRequest<IContainGeoPlanet>(() => new GeoPlanetContainer(geoPlanetAppId));
            container.RegisterPerWebRequest<IConsumePlaceFinder, PlaceFinderClient>();
        }
    }
}
