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

            var places = directCountries.Union(ancestorCountries).Union(directNonCountries).Union(ancestorNonCountries);
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
            var minYear = activities.Where(x => x.StartsOn.HasValue).Min(x => x.StartsOn.Value.Year);
            var maxStartYear = activities.Where(x => x.StartsOn.HasValue).Max(x => x.StartsOn.Value.Year);
            var maxEndsYear = activities.Where(x => x.EndsOn.HasValue).Max(x => x.EndsOn.Value.Year);
            if (maxStartYear > maxEndsYear)
                maxEndsYear = maxStartYear;
            var years = new List<int>();
            if (minYear > 0 && maxEndsYear >= minYear)
                for (var i = minYear; i <= maxEndsYear; i++)
                    years.Add(i);

            var views = placesArray.Select(place =>
            {
                var activitiesInPlace = activitiesArray
                    .Where(activity =>
                        activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                        activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId)))
                    .ToArray();
                var view = new EmployeePlacesView
                {
                    EstablishmentId = establishmentId,
                    PlaceId = place.RevisionId,
                    PlaceName = place.OfficialName,
                    IsCountry = place.IsCountry,
                    CountryCode = place.IsCountry && place.GeoPlanetPlace != null
                        ? place.GeoPlanetPlace.Country.Code
                        : place.Ancestors.Any(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                            ? place.Ancestors.First(node => node.Ancestor.IsCountry && node.Ancestor.GeoPlanetPlace != null)
                                .Ancestor.GeoPlanetPlace.Country.Code
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
                        // for this year, need both activityid's and personid's.
                        // first let's get the activities for this year.
                        // an activity is counted in this year if it started in this year,
                        // or if it ended in this year.
                        // an activity is also included if it started before this year,
                        // unless it ended before this year.
                        var yearActivities = activitiesInPlace.Where(activity =>
                            (activity.StartsOn.HasValue || activity.EndsOn.HasValue)
                            &&
                            (
                                (activity.StartsOn.HasValue && activity.StartsOn.Value.Year == year) ||
                                (activity.EndsOn.HasValue && activity.EndsOn.Value.Year == year) ||
                                (activity.StartsOn.HasValue && activity.StartsOn.Value.Year <= year && (!activity.EndsOn.HasValue || activity.EndsOn.Value.Year >= year))
                            )
                        )
                        .ToArray();

                        var startsOnValues = yearActivities.Select(x => x.StartsOn.HasValue ? x.StartsOn.Value.Year : (int?)null).Distinct().OrderByDescending(x => x).ToArray();
                        var endsOnValues = yearActivities.Select(x => x.EndsOn.HasValue ? x.EndsOn.Value.Year : (int?)null).Distinct().OrderByDescending(x => x).ToArray();

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
            .ToList();

            views.Insert(0, new EmployeePlacesView
            {
                EstablishmentId = establishmentId,
                ActivityIds = activitiesArray.Select(x => x.ActivityId).Distinct().ToArray(),
                ActivityPersonIds = activitiesArray.Select(x => x.Activity.PersonId).Distinct().ToArray(),
                ActivityTypes = activityTypes != null
                    ? activityTypes.Select(x => 
                        new EmployeePlaceActivityTypeView
                        {
                            HasIcon = !string.IsNullOrWhiteSpace(x.IconPath),
                            ActivityTypeId = x.Id,
                            Text = x.Type,
                            Rank = x.Rank,
                            ActivityPersonIds = activitiesArray
                                .Where(activity => activity.Types.Any(type => type.TypeId == x.Id))
                                .Select(activity => activity.Activity.PersonId).Distinct().ToArray(),
                            ActivityIds = activitiesArray
                                .Where(activity => activity.Types.Any(type => type.TypeId == x.Id))
                                .Select(activity => activity.ActivityId).Distinct().ToArray(),
                        }).ToArray()
                    : null,
                Years = years.Select(year =>
                {
                    // for this year, need both activityid's and personid's.
                    // first let's get the activities for this year.
                    // an activity is counted in this year if it started in this year,
                    // or if it ended in this year.
                    // an activity is also included if it started before this year,
                    // unless it ended before this year.
                    var yearActivities = activitiesArray.Where(activity =>
                        (activity.StartsOn.HasValue || activity.EndsOn.HasValue)
                        &&
                        (
                            (activity.StartsOn.HasValue && activity.StartsOn.Value.Year == year) ||
                            (activity.EndsOn.HasValue && activity.EndsOn.Value.Year == year) ||
                            (activity.StartsOn.HasValue && activity.StartsOn.Value.Year <= year && (!activity.EndsOn.HasValue || activity.EndsOn.Value.Year >= year))
                        )
                    )
                    .Distinct().ToArray();

                    var startsOnValues = yearActivities.Select(x => x.StartsOn.HasValue ? x.StartsOn.Value.Year : (int?)null).Distinct().OrderByDescending(x => x).ToArray();
                    var endsOnValues = yearActivities.Select(x => x.EndsOn.HasValue ? x.EndsOn.Value.Year : (int?)null).Distinct().OrderByDescending(x => x).ToArray();

                    var activityIds = yearActivities.Select(activity => activity.ActivityId).Distinct().ToArray();
                    var activityPersonIds = yearActivities.Select(activity => activity.Activity.PersonId).Distinct().ToArray();
                    return new EmployeePlaceActivityYearView
                    {
                        Year = year,
                        ActivityIds = activityIds,
                        ActivityPersonIds = activityPersonIds,
                    };
                }).ToArray(),
            });

            return views.ToArray();
        }
    }
}