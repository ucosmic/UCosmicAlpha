using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class ActivityElementsController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public ActivityElementsController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all activity locations
        */
        // --------------------------------------------------------------------------------
        [GET("activity-locations")]
        public ICollection<ActivityLocationNameApiModel> GetActivityLocations()
        {
            var locations = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { IsCountry = true }));
            var water = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { IsWater = true }));
            var global = new List<Place>(_queryProcessor.Execute(new FilteredPlaces { WoeIds = new int[] { 1 } }));
            var regions = new List<Place>(_queryProcessor.Execute(new FilteredPlaces
            {
                WoeIds = new int[]
                {
                    24865670, // Africa
                    28289421, // Antarctic
                    24865672, // North America
                    24865706, // Caribbean
                    55949061, // Central Asia
                    55949062, // South Asia
                    28289414, // South East Asia
                    28289416, // East Asia
                    28289415, // Western Asia
                    24865716, // Latin America
                    24865707, // Central America
                    24865673, // South America
                    24865721, // Middle East
                    24865722, // North Africa
                    55949070, // Oceania
                    55949067, // Northern Europe
                    55949066, // Southern Europe
                    28289419, // Eastern Europe
                    28289418, // Western Europe
                }
            }));

            locations.AddRange(water);
            locations.AddRange(global);
            locations.AddRange(regions);

            var model = Mapper.Map<ActivityLocationNameApiModel[]>(locations.ToArray());
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get all establishments by keyword
        */
        // --------------------------------------------------------------------------------
        [GET("activity-establishments")]
        public IEnumerable<ActivityEstablishmentApiModel> GetActivityInstitutions(string keyword)
        {
            var pagedEstablishments = _queryProcessor.Execute(new EstablishmentViewsByKeyword
            {
                Keyword = keyword,
                PageSize = int.MaxValue,
                PageNumber = 1
            });

            var model = Mapper.Map<IEnumerable<EstablishmentView>, IEnumerable<ActivityEstablishmentApiModel>>(pagedEstablishments.Items);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get activity counts by country
        */
        // --------------------------------------------------------------------------------
        [GET("activity-country-counts")]
        public IEnumerable<ActivityPlaceCount> GetActivityCountryCounts()
        {
            Place[] countries = _queryProcessor.Execute(new Countries()).ToArray();
            var countryCounts = new ActivityPlaceCount[countries.Length];

            for (int i = 0; i < countries.Length; i += 1)
            {
                countryCounts[i] = new ActivityPlaceCount
                {
                    PlaceId = countries[i].RevisionId,
                    OfficialName = countries[i].OfficialName,
                    Count = _queryProcessor.Execute(new ActivityCountByCountry(countries[i].RevisionId))
                };
            }

            return countryCounts;
        }
    }
}
