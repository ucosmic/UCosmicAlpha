using System.Diagnostics;
using System.Linq;
using NGeo.Yahoo.GeoPlanet;
using UCosmic.Domain.Places;
using Place = UCosmic.Domain.Places.Place;

namespace UCosmic.SeedData
{
    public class PlaceByGeoPlanetEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IContainGeoPlanet _geoPlanet;

        public PlaceByGeoPlanetEntitySeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IContainGeoPlanet geoPlanet
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _geoPlanet = geoPlanet;
        }

        public void Seed()
        {
            if (_entities.Get<Place>().Any()) return;

            var earth = _queryProcessor.Execute(new PlaceByWoeId(GeoPlanetPlace.EarthWoeId));
            Debug.Assert(earth != null);

            var geoPlanetContinents = _geoPlanet.Continents()
                .OrderBy(c => c.Name)
                .ToArray()
            ;
            foreach (var geoPlanetContinent in geoPlanetContinents)
            {
                var continent = _queryProcessor.Execute(new PlaceByWoeId(geoPlanetContinent.WoeId));
                Debug.Assert(continent != null);
            }

            //var countriesToImport = new[]
            //{
            //    "United States", "China", "United Kingdom", "Peru", "South Africa", "Australia", "India", "Egypt",
            //};
            var countriesToImport = new[]
            {
                "United States", "China", "United Kingdom",
            };
            var geoPlanetCountries = _geoPlanet.Countries()
                .Where(c => countriesToImport.Contains(c.Name))
                .OrderBy(c => c.Name)
                .ToArray()
            ;
            foreach (var geoPlanetCountry in geoPlanetCountries)
            {
                var country = _queryProcessor.Execute(new PlaceByWoeId(geoPlanetCountry.WoeId));
                Debug.Assert(country != null);
            }

            foreach (var geoPlanetCountry in geoPlanetCountries)
            {
                var geoPlanetStates = _geoPlanet.States(geoPlanetCountry.WoeId)
                    .OrderBy(s => s.Name)
                    .Take(5)
                    .ToArray()
                ;
                if (!geoPlanetStates.Any()) continue;
                foreach (var geoPlanetState in geoPlanetStates)
                {
                    var state = _queryProcessor.Execute(new PlaceByWoeId(geoPlanetState.WoeId));
                    Debug.Assert(state != null);
                }
            }
        }
    }
}
