using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
using SimpleInjector;

namespace UCosmic.WebApi
{
    public static class SimpleInjectorNGeoRegistration
    {
        public static void RegisterNGeo(this Container container, string geoNamesUserName, string geoPlanetAppId)
        {
            container.RegisterPerWebRequest<IConsumeGeoNames, GeoNamesClient>();
            container.RegisterPerWebRequest<IContainGeoNames>(() => new GeoNamesContainer(geoNamesUserName));
            container.RegisterPerWebRequest<IConsumeGeoPlanet, GeoPlanetClient>();
            container.RegisterPerWebRequest<IContainGeoPlanet>(() => new GeoPlanetContainer(geoPlanetAppId));
        }
    }
}
