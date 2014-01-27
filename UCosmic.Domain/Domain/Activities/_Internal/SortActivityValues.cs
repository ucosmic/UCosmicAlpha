using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace UCosmic.Domain.Activities
{
    public static class SortActivityValues
    {
        public static IDictionary<Expression<Func<ActivityValues, object>>, OrderByDirection> Recency(
            this IDictionary<Expression<Func<ActivityValues, object>>, OrderByDirection> orderBy, OrderByDirection direction)
        {
            if (orderBy == null)
                orderBy = new Dictionary<Expression<Func<ActivityValues, object>>, OrderByDirection>();

            var otherDirection = direction == OrderByDirection.Ascending
                ? OrderByDirection.Descending : OrderByDirection.Ascending;

            // note that "desc" here means most recent will come at the top (they have the most recency, descending to less recent activities)
            // this puts all ongoings at the top when most recent, at bottom when least recent
            orderBy.Add(x => x.OnGoing.HasValue
                ? x.OnGoing // need this to keep false ongoings from bubbling to the top
                : false, direction);

            // sort by year descending. Year comes from end date first, or start date if end date is null, or int.MinValue if start date is null
            // this will group the list by year descending, essentially creating 1 sort group for each coalesced year
            orderBy.Add(x => x.EndsOn.HasValue
                ? x.EndsOn.Value.Year
                : x.StartsOn.HasValue
                    ? x.StartsOn.Value.Year
                    : int.MinValue, direction);

            // activities that have both a start date & end date in same year come at the top (true above false)
            // but remember, activities with only a start date are implied to have ended in the same year
            orderBy.Add(x => x.StartsOn.HasValue && x.EndsOn.HasValue && x.StartsOn.Value.Year == x.EndsOn.Value.Year
                || (x.StartsOn.HasValue && !x.EndsOn.HasValue), direction);

            // activities that have both start & end come at bottom (true below false) because they will not be in same year
            // after the sort expression above puts ones in same year at the top
            orderBy.Add(x => x.EndsOn.HasValue && x.StartsOn.HasValue && x.EndsOn.Value.Year != x.StartsOn.Value.Year, otherDirection);

            // so far all date sorting has been by year: use this to also sort by month & day descending
            orderBy.Add(x => x.EndsOn ?? x.StartsOn, direction);

            // activities that have both start & end have already been sorted by end date
            // within these, also need to sorty by start date
            orderBy.Add(x => x.StartsOn.HasValue && x.EndsOn.HasValue ? x.StartsOn : (DateTime?)null, direction);

            // finally, sort by title alphabetically
            orderBy.Add(x => x.Title, OrderByDirection.Ascending);

            return orderBy;
        }
    }
}