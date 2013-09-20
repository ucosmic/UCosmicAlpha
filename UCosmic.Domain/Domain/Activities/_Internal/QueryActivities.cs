using System;
using System.Linq;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    internal static class QueryActivities
    {
        internal static IQueryable<Activity> WithPersonId(this IQueryable<Activity> queryable, int personId)
        {
            queryable = queryable.Where(a => a.PersonId == personId);
            return queryable;
        }

        internal static IQueryable<Activity> WithUserName(this IQueryable<Activity> queryable, string userName)
        {
            return queryable.Where(
                a =>
                a.Person.User != null &&
                a.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase)
            );
        }

        internal static Activity ByUserNameAndNumber(this IQueryable<Activity> queryable,
                                                     string modeText,
                                                     string userName,
                                                     int number)
        {
            return queryable.SingleOrDefault(
                a =>
                a.ModeText == modeText &&
                a.Person.User != null &&
                a.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase) &&
                a.Number == number
            );
        }

        internal static Activity ByEntityId(this IQueryable<Activity> queryable, int id)
        {
            return queryable.SingleOrDefault(
                a =>
                a.RevisionId == id
            );
        }

        internal static Activity ById(this IQueryable<Activity> queryable, int id)
        {
            return queryable.SingleOrDefault(
                a =>
                a.RevisionId == id
            );
        }

        internal static IQueryable<Activity> WithTenant(this IQueryable<Activity> queryable, object tenant)
        {
            var tenantId = tenant as int?;
            var tenantGuid = tenant as Guid?;
            var tenantUrl = tenant as string;

            if (tenantGuid.HasValue && tenantGuid != Guid.Empty)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.EntityId.Equals(tenantGuid)
                    )
                );
            }

            if (tenantId.HasValue)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.RevisionId.Equals(tenantId)
                    )
                );
            }

            if (tenantUrl != null)
            {
                return queryable.Where(
                    a =>
                    a.Person.Affiliations.Any
                    (
                        f =>
                        f.IsDefault &&
                        f.Establishment.Urls.Any
                        (
                            u =>
                            u.Value.Equals(tenantUrl, StringComparison.OrdinalIgnoreCase)
                        )
                    )
                );
            }

            throw new NotSupportedException(string.Format("Value of tenant '{0}' was of an unsupported type ({1}).",
                tenant, tenant != null ? tenant.GetType().Name : "null"));
        }

        internal static IQueryable<Activity> WithMode(this IQueryable<Activity> queryable, string modeText)
        {
            return string.IsNullOrWhiteSpace(modeText) ? queryable : queryable.Where(a => a.ModeText == modeText);
        }

        internal static IQueryable<Activity> WithKeyword(this IQueryable<Activity> queryable, string modeText, string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return queryable;

            return queryable.Where(
                a =>
                a.ModeText == modeText &&
                a.Values.First(x => x.Mode == ActivityMode.Public).Title.Contains(keyword) ||
                a.Person.DisplayName.Contains(keyword) // ||
                //a.Tags.Any
                //(
                //    t =>
                //    t.ModeText == modeText &&
                //    t.Text.Contains(keyword)
                //)
            );
        }

        internal static IQueryable<Activity> Published(this IQueryable<Activity> queryable)
        {
            var publicText = ActivityMode.Public.AsSentenceFragment();
            queryable = queryable.Where(x => publicText.Equals(x.ModeText) && !x.EditSourceId.HasValue);
            return queryable;
        }

        internal static IQueryable<Activity> AffiliatedWith(this IQueryable<Activity> queryable, int establishmentId)
        {
            // ReSharper disable PossibleNullReferenceException
            queryable = queryable.Where(x =>
                x.Person.Affiliations.Count(y => y.IsDefault) == 1
                &&
                (
                    x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).EstablishmentId == establishmentId
                    ||
                    x.Person.Affiliations.FirstOrDefault(y => y.IsDefault).Establishment.Ancestors.Any(y => y.AncestorId == establishmentId)
                    ||
                    x.Person.Affiliations.Any(y => y.CampusId == establishmentId && y.Campus.Ancestors.Any(z => z.AncestorId == x.Person.Affiliations.FirstOrDefault(f => f.IsDefault).EstablishmentId))
                    ||
                    x.Person.Affiliations.Any(y => y.CollegeId == establishmentId && y.College.Ancestors.Any(z => z.AncestorId == x.Person.Affiliations.FirstOrDefault(f => f.IsDefault).EstablishmentId))
                    ||
                    x.Person.Affiliations.Any(y => y.DepartmentId == establishmentId && y.Department.Ancestors.Any(z => z.AncestorId == x.Person.Affiliations.FirstOrDefault(f => f.IsDefault).EstablishmentId))
                )
            );
            // ReSharper restore PossibleNullReferenceException
            return queryable;
        }

        internal static IQueryable<Activity> InDateRange(this IQueryable<Activity> queryable, DateTime from, DateTime to)
        {
            // work only with publics in this method
            var publicText = ActivityMode.Public.AsSentenceFragment();
            return queryable.Where(x =>
                x.Values.Count(y => y.ModeText == publicText) == 1
                &&
                (   // include undated
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing.HasValue
                    &&
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn.HasValue
                )
                ||
                (   // ongoing (do not check EndsOn here)
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing == true
                )
                ||
                (   // end date only (including future)
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn.Value >= from
                    &&
                    (
                        !x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing.HasValue
                        ||
                        x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing == false
                    )
                )
                ||
                (   // start date & ongoing (do not check EndsOn)
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn < to
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing == true
                )
                ||
                (   // start date only
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn >= from
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn < to
                    &&
                    !x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn.HasValue
                    &&
                    (
                        !x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing.HasValue
                        ||
                        x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing == false
                    )
                )
                ||
                (   // start & end dates
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).StartsOn >= from
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn.HasValue
                    &&
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).EndsOn < to
                    &&
                    (
                        !x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing.HasValue
                        ||
                        x.Values.FirstOrDefault(y => y.ModeText == publicText).OnGoing == false
                    )
                )
            );
        }

        internal static IQueryable<Place> Places(this IQueryable<Activity> queryable)
        {
            // work only with publics in this method
            var publicText = ActivityMode.Public.AsSentenceFragment();
            var values = queryable.SelectMany(x => x.Values.Where(y => y.ModeText == publicText));
            var locations = values.SelectMany(x => x.Locations.Select(y => y.Place));
            var ancestors = locations.SelectMany(x => x.Ancestors.Select(y => y.Ancestor));
            var places = locations.Union(ancestors).Distinct();
            return places;
        }

        internal static IQueryable<Activity> WithActivityType(this IQueryable<Activity> queryable, int activityTypeId)
        {
            // work only with publics in this method
            var publicText = ActivityMode.Public.AsSentenceFragment();
            var values = queryable.SelectMany(x => x.Values.Where(y => y.ModeText == publicText));
            return values.Where(x => x.Types.Any(y => y.TypeId == activityTypeId)).Select(x => x.Activity);
        }

        internal static IQueryable<Activity> WithPlace(this IQueryable<Activity> queryable, int placeId)
        {
            // ReSharper disable PossibleNullReferenceException
            // work only with publics in this method
            var publicText = ActivityMode.Public.AsSentenceFragment();
            queryable = queryable.Where(x => x.Values.Count(y => y.ModeText == publicText) == 1);
            if (placeId == 1)
            {
                queryable = queryable.Where(x =>
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).Locations.Any(y => y.PlaceId == placeId)
                );
            }
            else
            {
                queryable = queryable.Where(x =>
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).Locations.Any(y => y.PlaceId == placeId)
                    ||
                    x.Values.FirstOrDefault(y => y.ModeText == publicText).Locations.Any(y => y.Place.Ancestors.Any(z => z.AncestorId == placeId))
                );
            }
            //var values = queryable.SelectMany(x => x.Values.Where(y => y.ModeText == publicText));
            //if (placeId == 1) // do not count global as an ancestor
            //    return values.Where(x => x.Locations.Any(y => y.PlaceId == placeId)).Select(x => x.Activity);
            //return values.Where(x => x.Locations.Any(y => y.PlaceId == placeId) || x.Locations.Any(y => y.Place.Ancestors.Any(z => z.AncestorId == placeId)))
            //    .Select(x => x.Activity);
            return queryable;
            // ReSharper restore PossibleNullReferenceException
        }
    }
}
