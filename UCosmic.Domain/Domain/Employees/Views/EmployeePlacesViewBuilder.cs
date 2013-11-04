using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Employees
{
    public class EmployeePlacesViewBuilder
    {
        private readonly IQueryEntities _entities;

        public EmployeePlacesViewBuilder(IQueryEntities entities)
        {
            _entities = entities;
        }

        internal IEnumerable<int> GetEstablishmentIdsWithData()
        {
            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var establishmentsWithActivities = _entities.Query<Activity>()
                .Where(x => x.Original == null && x.ModeText == publishedText && x.Person.Affiliations.Any(y => y.IsDefault))
                .Select(x => x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment)
                .Distinct()
            ;
            var establishmentsWithDegrees = _entities.Query<Degree>()
                .Where(x => x.Person.Affiliations.Any(y => y.IsDefault))
                .Select(x => x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment)
                .Distinct()
            ;
            var establishmentIdsWithEmployeeData = establishmentsWithActivities.Union(establishmentsWithDegrees)
                .Select(x => x.RevisionId)
            ;

            return establishmentIdsWithEmployeeData;
        } 

        internal EmployeePlacesView[] Build(int establishmentId)
        {
            var publishedText = ActivityMode.Public.AsSentenceFragment();
            var activitiesEagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                x => x.Activity,
                x => x.Locations.Select(y => y.Place.Ancestors),
            };
            var activities = _entities.Query<Activity>()
                .Where(x =>
                    x.Original == null && x.ModeText == publishedText && // published, non-work-copy
                    x.Person.Affiliations.Any(y => y.IsDefault) // make sure person's default affiliation is not null
                    &&
                    (   // person's default affiliation is with or underneath the tenant domain being queried
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId == establishmentId
                        ||
                        x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment.Ancestors.Any(y => y.AncestorId == establishmentId)
                    )
                )
                .Select(x => x.Values.FirstOrDefault(y => y.ModeText == publishedText))
                .EagerLoad(_entities, activitiesEagerLoad)
            ;

            var countriesEagerLoad = new Expression<Func<Place, object>>[] { x => x.GeoPlanetPlace, };
            var directCountries = activities.SelectMany(x => x.Locations.Select(y => y.Place)) // get all countries from locations collection
                .EagerLoad(_entities, countriesEagerLoad)
                .Where(x => x.IsCountry)
                .Distinct()
            ;
            var ancestorCountries = activities.SelectMany(x => x.Locations.SelectMany(y => y.Place.Ancestors.Select(z => z.Ancestor))) // get all countries from locations collection
                .EagerLoad(_entities, countriesEagerLoad)
                .Where(x => x.IsCountry)
                .Distinct()
            ;

            var nonCountriesEagerLoad = new Expression<Func<Place, object>>[] { x => x.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace), };
            var directNonCountries = activities.SelectMany(x => x.Locations.Select(y => y.Place)) // get all countries from locations collection
                .EagerLoad(_entities, nonCountriesEagerLoad)
                .Where(x => !x.IsCountry)
                .Distinct()
            ;
            var ancestorNonCountries = activities.SelectMany(x => x.Locations.SelectMany(y => y.Place.Ancestors.Select(z => z.Ancestor))) // get all countries from locations collection
                .EagerLoad(_entities, nonCountriesEagerLoad)
                .Where(x => !x.IsCountry)
                .Distinct()
            ;

            var places = directCountries.Union(ancestorCountries).Union(directNonCountries).Union(ancestorNonCountries);
            var placesArray = places.Distinct().ToArray();
            var activitiesArray = activities.ToArray();

            var views = placesArray.Select(place => new EmployeePlacesView
            {
                PlaceId = place.RevisionId,
                PlaceName = place.OfficialName,
                IsCountry = place.IsCountry,
                CountryCode = place.IsCountry && place.GeoPlanetPlace != null
                    ? place.GeoPlanetPlace.Country.Code
                    : place.Ancestors.Any(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                        ? place.Ancestors.First(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                            .Ancestor.GeoPlanetPlace.Country.Code
                        : null,
                ActivityPersonIds = activitiesArray
                    .Where(activity =>
                        activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                        activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId)))
                    .Select(activity => activity.Activity.PersonId).Distinct().ToArray(),
                ActivityIds = activitiesArray
                    .Where(activity =>
                        activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                        activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId)))
                    .Select(activity => activity.ActivityId).Distinct().ToArray(),
            })
            .ToArray();

            return views;
        }
    }
}