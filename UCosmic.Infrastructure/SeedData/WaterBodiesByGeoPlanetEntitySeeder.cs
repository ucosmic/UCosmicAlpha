using System;
using System.Linq;
using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
using UCosmic.Domain.Places;
using Place = UCosmic.Domain.Places.Place;

namespace UCosmic.SeedData
{
    public class WaterBodiesByGeoPlanetEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly IContainGeoPlanet _geoPlanet;
        private readonly IContainGeoNames _geoNames;
        private readonly IHandleCommands<UpdatePlaceGeoNamesReference> _updateGeoName;

        public WaterBodiesByGeoPlanetEntitySeeder(IProcessQueries queryProcessor
            , IQueryEntities entities
            , IContainGeoPlanet geoPlanet
            , IContainGeoNames geoNames
            , IHandleCommands<UpdatePlaceGeoNamesReference> updateGeoName
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _geoPlanet = geoPlanet;
            _geoNames = geoNames;
            _updateGeoName = updateGeoName;
        }

        public void Seed()
        {
            if (_entities.Query<Place>().Any(x => x.IsWater)) return;

            var watersToSeed = new[] {
                "Adriatic Sea",
                "Andaman Sea",
                "Southern Ocean",
                "Arabian Sea",
                "Arafura Sea",
                "Aral Sea",
                "Arctic Ocean",
                "Baffin Bay",
                "Barents Sea",
                "Bay of Bengal",
                "Bay of Biscay",
                "Beaufort Sea",
                "Bering Sea",
                "Black Sea",
                "Caribbean Sea",
                "Caspian Sea",
                "Celebes Sea",
                "Chukchi Sea",
                "Coral Sea",
                "Dead Sea",
                "East China Sea",
                "East Siberian Sea",
                "Flores Sea",
                "Greenland Sea",
                "Gulf of Aden",
                "Gulf of Alaska",
                "Gulf of Bothnia",
                "Gulf of Guinea",
                "Gulf of Mexico",
                "Gulf of Oman",
                "Gulf of St. Lawrence",
                "Hudson Bay",
                "Indian Ocean",
                "Java Sea",
                "Kara Sea",
                "Labrador Sea",
                "Laptev Sea",
                "Mediterranean Sea",
                "North Atlantic Ocean",
                "North Pacific Ocean",
                "North Sea",
                "Pacific Ocean",
                "Persian Gulf",
                "Philippine Sea",
                "Red Sea",
                "Sargasso Sea",
                "Scotia Sea",
                "Sea of Japan",
                "Sea of Okhotsk",
                "South Atlantic Ocean",
                "South China Sea",
                "South Pacific Ocean",
                "Tasman Sea",
                "Timor Sea",
                "White Sea",
                "Yellow Sea",
            };
            var geoPlanetSkips = new[] { "North Atlantic Ocean", "North Pacific Ocean", "South Atlantic Ocean", "South Pacific Ocean", };

            foreach (var waterToSeed in watersToSeed)
            {
                // for bodies of water, trust geonames over geoplanet

                var geoPlanetPlaces = _geoPlanet.Places(waterToSeed);
                var geoPlanetToponyms = _geoNames.Search(new SearchOptions(SearchType.NameEquals, waterToSeed));

                var geoNamesToponym = geoPlanetToponyms.FirstOrDefault(x => x.FeatureClassCode == "H");
                var geoPlanetPlace = geoPlanetPlaces.FirstOrDefault(x => x.Type.Code == 37 || x.Type.Code == 38);
                if (waterToSeed == "Dead Sea") // there is a dead sea lake in NY
                    geoNamesToponym = geoPlanetToponyms.FirstOrDefault(x => x.FeatureClassCode == "H" && x.CountryCode != "US");
                if (waterToSeed == "Baffin Bay") // there is one of these in TX too
                    geoNamesToponym = geoPlanetToponyms.FirstOrDefault(x => x.FeatureClassCode == "H" && x.CountryCode == null);

                if (geoNamesToponym == null)
                    throw new ApplicationException(string.Format("Unable to find toponym for '{0}'.", waterToSeed));

                // seed by GP if present
                if (geoPlanetPlace != null && (!geoPlanetSkips.Contains(waterToSeed) &&
                    geoPlanetPlace.Name.Equals(waterToSeed) || waterToSeed == "Sea of Japan"))
                {
                    _queryProcessor.Execute(new PlaceByWoeId(geoPlanetPlace.WoeId, geoNamesToponym.GeoNameId));
                }
                else
                {
                    _queryProcessor.Execute(new PlaceByGeoNameId(geoNamesToponym.GeoNameId));
                }
            }
        }
    }
}
