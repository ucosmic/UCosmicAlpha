using System.Collections.Generic;
using System.Linq;
using UCosmic.Domain.Places;

namespace UCosmic.SeedData
{
    public class RegionsByGeoPlanetEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public RegionsByGeoPlanetEntitySeeder(IProcessQueries queryProcessor
            , IQueryEntities entities
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public void Seed()
        {
            //if (_entities.Query<Place>().Any(x => x.IsWater)) return;

            // map Woe ID's to GeoName ID's
            var regionsToImport = new Dictionary<int, int?>
            {
                { 24865706, 7729891 }, // Caribbean
                { 24865716, 7730009 }, // Latin America
                //{ 55949058, null }, // Americas
                { 24865707, 7729892 }, // Central America
                { 55949061, 7729893 }, // Central Asia
                { 55949062, 7729895 }, // South Asia
                { 28289414, 7729896 }, // SouthEast Asia
                { 28289416, 7729894 }, // East Asia
                { 28289415, 7729897 }, // West Asia
                { 24865721, 6269133 }, // Middle East
                { 24865722, 7729887 }, // North Africa
                { 55949067, 7729883 }, // North Europe
                { 55949066, 7729882 }, // South Europe
                { 28289419, 7729884 }, // East Europe
                { 28289418, 7729881 }, // West Europe
            };

            foreach (var woeId in regionsToImport.Keys)
            {
                var geoNameId = regionsToImport[woeId];
                var geoPlanet = _entities.Query<GeoPlanetPlace>().SingleOrDefault(x => x.WoeId == woeId) ??
                              _queryProcessor.Execute(new SingleGeoPlanetPlace(woeId));
                GeoNamesToponym geoName = null;
                if (geoNameId.HasValue)
                {
                    geoName = _entities.Query<GeoNamesToponym>().SingleOrDefault(x => x.GeoNameId == geoNameId.Value) ??
                              _queryProcessor.Execute(new SingleGeoNamesToponym(geoNameId.Value));
                }
                if (geoPlanet.Place == null || (geoName != null && geoName.Place == null))
                {
                    _queryProcessor.Execute(new PlaceByWoeId(woeId, geoNameId));
                }
            }
        }
    }
}
