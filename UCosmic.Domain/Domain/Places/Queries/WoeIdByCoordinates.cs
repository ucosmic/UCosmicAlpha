using System;
using System.Collections.Generic;
using System.Linq;
#if AZURE
using NGeo.Yahoo.PlaceFinder;
#else
using System.Text;
using NGeo.GeoNames;
using NGeo.Yahoo.GeoPlanet;
#endif

namespace UCosmic.Domain.Places
{
    public class WoeIdByCoordinates : IDefineQuery<int>
    {
        public WoeIdByCoordinates(double latitude, double longitude)
        {
            Coordinates = new Coordinates(latitude, longitude);
        }

        public Coordinates Coordinates { get; private set; }
    }

#if AZURE

        public class HandlePaidWoeIdByCoordinatesQuery : IHandleQueries<WoeIdByCoordinates, int>
    {
        private readonly IContainPlaceFinder _placeFinder;

        public HandlePaidWoeIdByCoordinatesQuery(IContainPlaceFinder placeFinder)
        {
            _placeFinder = placeFinder;
        }

        public int Handle(WoeIdByCoordinates query)
        {
            if (query == null) throw new ArgumentNullException("query");

            int? woeId = null;
            var retries = 0;
            const int retryLimit = 6;
            Result placeFinderResult = null;
            // ReSharper disable PossibleInvalidOperationException
            var latitude = query.Coordinates.Latitude.Value;
            var longitude = query.Coordinates.Longitude.Value;
            // ReSharper restore PossibleInvalidOperationException

            while (!woeId.HasValue && retries++ < retryLimit)
            {
                placeFinderResult = _placeFinder.Find(
                    new PlaceByCoordinates(latitude, longitude)).FirstOrDefault();
                if (placeFinderResult != null)
                {
                    woeId = placeFinderResult.WoeId;
                }
                if (!woeId.HasValue)
                {
                    latitude += 0.00001;
                    longitude += 0.00001;
                }
            }

            if (!woeId.HasValue && placeFinderResult != null)
            {
                var freeformText = string.Format("{0} {1}", placeFinderResult.CityName, placeFinderResult.CountryName);
                var result = _placeFinder.Find(new PlaceByFreeformText(freeformText)).FirstOrDefault();
                if (result != null) woeId = result.WoeId;
            }

            if (woeId.HasValue) return woeId.Value;
            return GeoPlanetPlace.EarthWoeId;
        }
    }

#else

    public class HandleFakeWoeIdByCoordinatesQuery : IHandleQueries<WoeIdByCoordinates, int>
    {
        private readonly IContainGeoNames _geoNames;
        private readonly IContainGeoPlanet _geoPlanet;

        public HandleFakeWoeIdByCoordinatesQuery(IContainGeoNames geoNames
            , IContainGeoPlanet geoPlanet
            , IProcessQueries queryProcessor
        )
        {
            _geoNames = geoNames;
            _geoPlanet = geoPlanet;
        }

        public int Handle(WoeIdByCoordinates query)
        {
            if (query == null) throw new ArgumentNullException("query");
            if (!query.Coordinates.Latitude.HasValue) throw new ArgumentException("Query's Coordinates.Latitude is null.");
            if (!query.Coordinates.Longitude.HasValue) throw new ArgumentException("Query's Coordinates.Longitude is null.");

            int? woeId = null;

            // first, invoke geonames geocoder
            var retryCount = 0;
            IEnumerable<Toponym> geoNames = null;
            while (geoNames == null && retryCount < 6)
            {
                ++retryCount;
                geoNames = _geoNames.FindNearbyPlaceName(new NearbyPlaceNameFinder
                {
                    Latitude = query.Coordinates.Latitude.Value,
                    Longitude = query.Coordinates.Longitude.Value,
                    Language = "en",
                }).ToArray();
            }
            if (geoNames == null)
                throw new ApplicationException("Querying GeoNames service resulted in null result.");
            geoNames = geoNames.ToArray();

            foreach (var geoName in geoNames)
            {
                // try to concord with woeid
                var concordance = _geoPlanet.Concordance(ConcordanceNamespace.GeoNames, geoName.GeoNameId);
                if (concordance == null || concordance.WoeId <= 0) continue;

                // make sure place exists
                var geoPlanetPlace = _geoPlanet.Place(concordance.WoeId);
                if (geoPlanetPlace == null) continue;

                woeId = concordance.WoeId;
                break;
            }

            // if there is still no WOE ID, try a textual search
            if (!woeId.HasValue)
            {
                foreach (var geoName in geoNames)
                {
                    var searchText = new StringBuilder(geoName.Name);
                    if (!string.IsNullOrWhiteSpace(geoName.Admin3Name))
                        searchText.Append(" " + geoName.Admin3Name);
                    if (!string.IsNullOrWhiteSpace(geoName.Admin2Name))
                        searchText.Append(" " + geoName.Admin2Name);
                    if (!string.IsNullOrWhiteSpace(geoName.Admin1Name))
                        searchText.Append(" " + geoName.Admin1Name);
                    searchText.Append(", " + geoName.CountryName);

                    var geoPlanetPlaces = _geoPlanet.Places(searchText.ToString())
                        .Where(x => x.WoeId > 0).ToArray();

                    NGeo.Yahoo.GeoPlanet.Place geoPlanetPlace = null;
                    if (geoPlanetPlaces.Length == 1)
                    {
                        geoPlanetPlace = geoPlanetPlaces.Single();
                    }
                    else if (geoPlanetPlaces.Length > 1)
                    {
                        // when multiple results are found, pick the one with
                        // the closest lat & lng match
                        var gn = geoName;
                        Func<NGeo.Yahoo.GeoPlanet.Place, double> coordinateComparer = x =>
                        {
                            // is this lat/lng greater or less than the geonames lat/lng?
                            var latDiff = x.Center.Latitude > gn.Latitude ? x.Center.Latitude - gn.Latitude : gn.Latitude - x.Center.Latitude;
                            var lngDiff = x.Center.Longitude > gn.Longitude ? x.Center.Longitude - gn.Longitude : gn.Longitude - x.Center.Longitude;
                            return latDiff + lngDiff;
                        };
                        var closest = geoPlanetPlaces.OrderBy(coordinateComparer).ToArray();
                        var separation = closest.Select(coordinateComparer).First();
                        if (separation < 1)
                            geoPlanetPlace = closest.First();
                    }

                    if (geoPlanetPlace != null)
                        woeId = geoPlanetPlace.WoeId;
                }
            }

            return woeId.HasValue
                ? woeId.Value
                : GeoPlanetPlace.EarthWoeId;
        }
    }

#endif

}
