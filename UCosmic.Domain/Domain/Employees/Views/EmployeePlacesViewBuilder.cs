using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Employees
{
    public class EmployeePlacesViewBuilder
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private static readonly string PublishedText = ActivityMode.Public.AsSentenceFragment();
        private static readonly string EstablishmentText = ActivityTagDomainType.Establishment.AsSentenceFragment();

        public EmployeePlacesViewBuilder(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        internal IEnumerable<int> GetEstablishmentIdsWithData()
        {
            var establishmentsWithActivities = _entities.Query<Activity>()
                // activities must be originals, published, and author must have a default affiliation
                .Where(x => x.Original == null && x.ModeText == PublishedText && x.Person.Affiliations.Any(y => y.IsDefault))

                // get the author's affiliated establishments which are offspring of the author's default affiliation
                .SelectMany(x => x.Person.Affiliations.Where(y => y.IsDefault ||
                    // ReSharper disable PossibleNullReferenceException
                    y.Establishment.Ancestors.Any(z => z.AncestorId == x.Person.Affiliations.FirstOrDefault(a => a.IsDefault).EstablishmentId)
                    // ReSharper restore PossibleNullReferenceException
                )
                .Select(y => y.Establishment))
                .Distinct()
            ;
            var establishmentAncestorsWithActivities = establishmentsWithActivities.SelectMany(x => x.Ancestors.Select(y => y.Ancestor))
                .Distinct()
            ;
            var establishmentIdsWithEmployeeData = establishmentsWithActivities
                .Union(establishmentAncestorsWithActivities)
                .Select(x => x.RevisionId)
            ;

            return establishmentIdsWithEmployeeData;
        }

        internal EmployeePlacesView[] Build(int establishmentId)
        {
            var activitiesEagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                x => x.Activity,
                x => x.Locations.Select(y => y.Place.Ancestors.Select(z => z.Ancestor)),
                x => x.Types,
                x => x.Tags,
            };

            // get all public activities for this establishment and all of its offspring establishments
            var activities = _entities.Query<Activity>()
                .Where(x =>
                    x.Original == null && x.ModeText == PublishedText && // published, non-work-copy
                    x.Person.Affiliations.Any(y => y.IsDefault) // make sure person's default affiliation is not null
                    &&
                    (   // person must be affiliated with this establishment or one of its offspring under the default affiliation
                        x.Person.Affiliations.Any(y => (y.EstablishmentId == establishmentId || y.Establishment.Ancestors.Any(z => z.AncestorId == establishmentId))
                            // ReSharper disable PossibleNullReferenceException
                            && (y.IsDefault || y.Establishment.Ancestors.Any(z => z.AncestorId == x.Person.Affiliations.FirstOrDefault(a => a.IsDefault).EstablishmentId)))
                            // ReSharper restore PossibleNullReferenceException
                    )
                )
                .Select(x => x.Values.FirstOrDefault(y => y.ModeText == PublishedText))
                .EagerLoad(_entities, activitiesEagerLoad)
            ;


            var countriesEagerLoad = new Expression<Func<Place, object>>[] { x => x.GeoPlanetPlace, };
            Expression<Func<ActivityValues, IEnumerable<Place>>> activityLocationPlaces = x => x.Locations.Select(y => y.Place);
            Expression<Func<ActivityValues, IEnumerable<Place>>> activityLocationPlaceAncestors = x => x.Locations
                .SelectMany(y => y.Place.Ancestors.Where(z => !z.Ancestor.IsEarth).Select(z => z.Ancestor));

            // TODO: this still does not account for activites tagged with a place.
            var establishmentPlaces = _entities.Query<EstablishmentLocation>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentLocation, object>>[]
                {
                    x => x.Places,
                })
                .Where(l => activities.SelectMany(a => a.Tags.Where(t => t.DomainTypeText == EstablishmentText)
                    .Select(t => t.DomainKey.HasValue ? t.DomainKey.Value : 0)).Contains(l.RevisionId))
                    .Select(x => new
                    {
                        EstablishmentId = x.RevisionId,
                        x.Places,
                    });
            var places = new[] { new Place() }.AsQueryable();

            // we query out country places separately from the others because the eager load is different for them
            // based on the view we are projecting into. namely, the CountryCode is identified in different parts of the aggregate.
            // we union the locations that are countries, locations whose parents are countries, and locations that are indirect countries
            var directCountries = activities.SelectMany(activityLocationPlaces)
                .EagerLoad(_entities, countriesEagerLoad)
                .Where(x => x.IsCountry)
                .Distinct()
            ;
            var ancestorCountries = activities.SelectMany(activityLocationPlaceAncestors)
                .EagerLoad(_entities, countriesEagerLoad)
                .Where(x => x.IsCountry)
                .Distinct()
            ;
            //var regionCountries = activities.SelectMany(activityLocationPlaces)
            //    .EagerLoad(_entities, countriesEagerLoad)
            //    .Where(x => x.IsRegion).SelectMany(x => x.Components).Where(x => x.IsCountry)
            //    .Distinct()
            //;
            var establishmentCountries = establishmentPlaces
                .SelectMany(x => x.Places)
                .EagerLoad(_entities, countriesEagerLoad)
                .Where(x => x.IsCountry)
                .Distinct()
            ;
            places = places.Union(directCountries).Union(ancestorCountries).Union(establishmentCountries);

            var nonCountriesEagerLoad = new Expression<Func<Place, object>>[] { x => x.Ancestors.Select(y => y.Ancestor.GeoPlanetPlace), };
            var directNonCountries = activities.SelectMany(activityLocationPlaces) // get all countries from locations collection
                .EagerLoad(_entities, nonCountriesEagerLoad)
                .Where(x => !x.IsCountry)
                .Distinct()
            ;
            var ancestorNonCountries = activities.SelectMany(activityLocationPlaceAncestors) // get all countries from locations collection
                .EagerLoad(_entities, nonCountriesEagerLoad)
                .Where(x => !x.IsCountry)
                .Distinct()
            ;
            //var regionNonCountries = activities.SelectMany(activityLocationPlaces)
            //    .EagerLoad(_entities, nonCountriesEagerLoad)
            //    .Where(x => x.IsRegion).SelectMany(x => x.Components).Where(x => !x.IsCountry)
            //    .Distinct()
            //;
            var establishmentNonCountries = establishmentPlaces
                .SelectMany(x => x.Places)
                .EagerLoad(_entities, nonCountriesEagerLoad)
                .Where(x => !x.IsCountry)
                .Distinct()
            ;
            places = places.Union(directNonCountries).Union(ancestorNonCountries).Union(establishmentNonCountries);

            var placesArray = places.Distinct().ToArray();
            var activitiesArray = activities.ToArray();
            var establishmentPlacesArray = establishmentPlaces.ToArray();

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
            years.Add(years.Min() - 1);
            years.Add(years.Max() + 1);

            var views = placesArray.Select(place =>
            {
                var activitiesInPlace = place.RevisionId != 0
                    ? activitiesArray
                        .Where(activity =>
                            activity.Locations.Any(location => location.PlaceId == place.RevisionId) ||
                            activity.Locations.Any(location => location.Place.Ancestors.Any(node => node.AncestorId == place.RevisionId && !place.IsEarth)) ||
                                //activity.Locations.Any(location => location.Place.IsRegion &&
                                //    (location.Place.Components.Any(c => c.RevisionId == place.RevisionId) ||
                                //    location.Place.Components.Any(c => c.Ancestors.Any(node => node.AncestorId == place.RevisionId)))) ||
                            activity.Tags.Any(tag => tag.DomainTypeText == EstablishmentText && tag.DomainKey.HasValue &&
                                establishmentPlacesArray.Any(e => e.EstablishmentId == tag.DomainKey.Value &&
                                    e.Places.Select(p => p.RevisionId).Contains(place.RevisionId)))
                        )
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
                    }).Where(x => x != null).ToArray(),
                };
                return view;
            })
            .ToArray();

            return views;
        }
    }
}