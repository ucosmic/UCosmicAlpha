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
        private readonly IProcessQueries _queryProcessor;

        public EmployeePlacesViewBuilder(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
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
                x => x.Types,
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

            var agnosticPlace = new[] { new Place() }.AsQueryable();
            var places = agnosticPlace.Union(directCountries).Union(ancestorCountries).Union(directNonCountries).Union(ancestorNonCountries);
            var placesArray = places.Distinct().ToArray();
            var activitiesArray = activities.ToArray();

            var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(establishmentId)
            {
                EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                {
                    x => x.ActivityTypes,
                },
            });
            var activityTypes = settings != null && settings.ActivityTypes.Any()
                ? settings.ActivityTypes.ToArray() : null;

            // get all applicable years for activities
            var currentYear = DateTime.UtcNow.Year;
            var minYear = activities.Any(x => x.StartsOn.HasValue)
                ? activities.Select(x => x.StartsOn.HasValue ? x.StartsOn.Value.Year : currentYear).Min() : currentYear;
            var maxStartYear = activities.Any(x => x.StartsOn.HasValue)
                ? activities.Select(x => x.StartsOn.HasValue ? x.StartsOn.Value.Year : currentYear).Max() : currentYear;
            var maxEndsYear = activities.Any(x => x.EndsOn.HasValue)
                ? activities.Select(x => x.EndsOn.HasValue ? x.EndsOn.Value.Year : currentYear).Max() : currentYear;
            if (maxStartYear > maxEndsYear)
                maxEndsYear = maxStartYear;
            var years = new List<int>();
            if (minYear > 0 && maxEndsYear >= minYear)
                for (var i = minYear; i <= maxEndsYear; i++)
                    years.Add(i);

            var views = placesArray.Select(place =>
            {
                var activitiesInPlace = place.RevisionId != 0
                    ? activitiesArray
                        .Where(activity =>
                            activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                            activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId)))
                        .ToArray()
                    : activitiesArray;
                var view = new EmployeePlacesView
                {
                    EstablishmentId = establishmentId,
                    PlaceId = place.RevisionId != 0 ? place.RevisionId : (int?)null,
                    PlaceName = place.OfficialName,
                    IsCountry = place.IsCountry,
                    CountryCode = place.RevisionId != 0
                        ? place.IsCountry && place.GeoPlanetPlace != null
                            ? place.GeoPlanetPlace.Country.Code
                            : place.Ancestors.Any(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                                ? place.Ancestors.First(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                                    .Ancestor.GeoPlanetPlace.Country.Code
                                : null
                        : null,
                    ActivityPersonIds = activitiesInPlace
                        .Select(activity => activity.Activity.PersonId).Distinct().ToArray(),
                    ActivityIds = activitiesInPlace
                        .Select(activity => activity.ActivityId).Distinct().ToArray(),
                    ActivityTypes = activityTypes != null
                        ? activityTypes.Select(x =>
                            new EmployeePlaceActivityTypeView
                            {
                                HasIcon = !string.IsNullOrWhiteSpace(x.IconPath),
                                ActivityTypeId = x.Id,
                                Text = x.Type,
                                Rank = x.Rank,
                                ActivityPersonIds = activitiesInPlace
                                    .Where(activity => activity.Types.Any(type => type.TypeId == x.Id))
                                    .Select(activity => activity.Activity.PersonId).Distinct().ToArray(),
                                ActivityIds = activitiesInPlace
                                    .Where(activity => activity.Types.Any(type => type.TypeId == x.Id))
                                    .Select(activity => activity.ActivityId).Distinct().ToArray(),
                            }).ToArray()
                        : null,
                    Years = years.Select(year =>
                    {
                        var yearActivities = activitiesInPlace.Where(activity =>
                            (activity.StartsOn.HasValue || activity.EndsOn.HasValue) // exclude undated activities
                            &&
                            (
                                // activities may occur within a particular year (or day)
                                (activity.StartsOn.HasValue && activity.StartsOn.Value.Year == year) ||
                                (activity.EndsOn.HasValue && activity.EndsOn.Value.Year == year) ||

                                // onging activities imply future years
                                (activity.StartsOn.HasValue && activity.StartsOn.Value.Year < year && activity.OnGoing.HasValue && activity.OnGoing.Value) ||

                                // non-ongoing activities get cut off
                                (activity.StartsOn.HasValue && activity.StartsOn.Value.Year < year && activity.EndsOn.HasValue && activity.EndsOn.Value.Year > year)
                            )
                        )
                        .ToArray();

                        var activityIds = yearActivities.Select(activity => activity.ActivityId).Distinct().ToArray();
                        var activityPersonIds = yearActivities.Select(activity => activity.Activity.PersonId).Distinct().ToArray();
                        return new EmployeePlaceActivityYearView
                        {
                            Year = year,
                            ActivityIds = activityIds,
                            ActivityPersonIds = activityPersonIds,
                        };
                    }).ToArray(),
                };
                return view;
            })
            .ToArray();

            return views;
        }
    }
}