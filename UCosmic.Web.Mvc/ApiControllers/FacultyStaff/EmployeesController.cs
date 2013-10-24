using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class EmployeesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _queryEntities;

        public EmployeesController(IProcessQueries queryProcessor, IQueryEntities queryEntities)
        {
            _queryProcessor = queryProcessor;
            _queryEntities = queryEntities;
        }

        [GET("{domain}/activities/places")]
        public IEnumerable<ActivityPlaceApiModel> GetActivityPlaces(string domain, [FromUri] ActivityPlacesInputModel input)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(2000);

            // get the tenant id
            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (tenant == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var tenantId = tenant.RevisionId;

            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var activities = _queryEntities.Query<Activity>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault) // make sure person's default affiliation is not null
                    &&
                    (   // person's default affiliation is with or underneath the tenant domain being queried
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId == tenantId
                        ||
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment.Ancestors.Any(y => y.AncestorId == tenantId)
                    )
                )
                .Where(x => x.Original == null && x.ModeText == publishedText) // published, non-work-copy
                .Select(x => x.Values.FirstOrDefault(y => y.ModeText == publishedText))
            ;

            var places = _queryEntities.Query<Place>().Where(x => x == null); // hack an empty places queryable
            if (input.Countries.HasValue && input.Countries.Value)
            {
                var countries = activities.SelectMany(x => x.Locations.Select(y => y.Place)) // get all places from locations collection
                    .Select(x => x.IsCountry // if the location is a country, select it
                        ? x
                        : x.Ancestors.Any(y => y.Ancestor.IsCountry) // otherwise select the location's parent country when one exists
                            ? x.Ancestors.FirstOrDefault(y => y.Ancestor.IsCountry).Ancestor
                            : null
                    )
                    .Where(x => x != null).Distinct()
                ;
                places = places.Union(countries);
            }
            if (input.PlaceIds != null && input.PlaceIds.Any())
            {
                var byId = activities.SelectMany(x => x.Locations.Select(y => y.Place)) // get all places from locations collection
                    .Select(x => input.PlaceIds.Contains(x.RevisionId) // if the location is the place, select it
                        ? x
                        : x.Ancestors.Any(y => input.PlaceIds.Contains(y.AncestorId)) // otherwise select the location's parent when one matches
                            ? x.Ancestors.FirstOrDefault(y => input.PlaceIds.Contains(y.AncestorId)).Ancestor
                            : null
                    )
                    .Where(x => x != null).Distinct()
                ;
                places = places.Union(byId);
            }

            var models = places.Select(place => new ActivityPlaceApiModel
            {
                PlaceId = place.RevisionId,
                PlaceName = place.OfficialName,
                IsCountry = place.IsCountry,
                CountryCode = place.IsCountry && place.GeoPlanetPlace != null
                    ? place.GeoPlanetPlace.Country.Code
                    : place.Ancestors.Any(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                        ? place.Ancestors.FirstOrDefault(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                            .Ancestor.GeoPlanetPlace.Country.Code
                        : null,
                ActivityIds = activities
                    .Where(activity =>
                        activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                        activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId)))
                    .Select(activity => activity.ActivityId),
            })
            .ToArray();

            return models;
        }

        [GET("{domain}/activities/summary")]
        public ActivitiesSummary GetActivitiesSummary(string domain)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(2000);

            // get the tenant id
            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (tenant == null) throw new HttpResponseException(HttpStatusCode.NotFound);
            var tenantId = tenant.RevisionId;

            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var activities = _queryEntities.Query<Activity>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault) // make sure person's default affiliation is not null
                    &&
                    (   // person's default affiliation is with or underneath the tenant domain being queried
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId == tenantId
                        ||
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment.Ancestors.Any(y => y.AncestorId == tenantId)
                    )
                )
                .Where(x => x.Original == null && x.ModeText == publishedText) // published, non-work-copy
                .Select(x => x.Values.FirstOrDefault(y => y.ModeText == publishedText))
            ;

            var model = new ActivitiesSummary
            {
                ActivityCount = activities.Count(),
                PersonCount = activities.Select(x => x.Activity.PersonId).Distinct().Count(),
                LocationCount = activities.SelectMany(x => x.Locations).Select(x => x.PlaceId).Distinct().Count(),
            };

            return model;
        }

        public class ActivitiesSummary
        {
            public int PersonCount { get; set; }
            public int ActivityCount { get; set; }
            public int LocationCount { get; set; }
        }

        public class ActivityPlaceApiModel
        {
            public ActivityPlaceApiModel()
            {
                ActivityIds = new int[0];
            }

            public int PlaceId { get; set; }
            public string PlaceName { get; set; }
            public bool IsCountry { get; set; }
            public string CountryCode { get; set; }
            public IEnumerable<int> ActivityIds { get; set; }
        }

        public class ActivityPlacesInputModel
        {
            public ActivityPlacesInputModel()
            {
                PlaceIds = new int[0];
            }

            public bool? Countries { get; set; }
            public IEnumerable<int> PlaceIds { get; set; }
        }
    }
}
