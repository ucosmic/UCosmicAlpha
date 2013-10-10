using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class MyActivitiesInputModel
    {
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public static class ActivitySearchInputProfiler
    {
        public class EntityToQuery : Profile
        {
            protected override void Configure()
            {
                /* Order as follows:
                 *  All ongoing first by fromDate, then title
                 *  If date(s) exist, order by:
                 *      if toDate exists, sort most recent first else, use fromDate
                 *          then alphabetically by title
                 *
                 *  Activities with no dates are listed last
                 */
                // see https://github.com/danludwig/Layout3/issues/28
                // sort first by ongoing, with ongoing at top
                // sort second by end date with youngest at top BUT...
                //      start date coalesces into end date when end date is null but start date is not null
                //      in other words, start date is assumed to be end date when start exists but end does not when sorting
                // third sort by title A-Z
                var defaultOrderBy = new Dictionary<Expression<Func<Activity, object>>, OrderByDirection>
                {
                    // this puts all ongoings at the top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing, OrderByDirection.Descending },

                    // sort by year descending. Year comes from end date first, or start date if end date is null, or int.MinValue if start date is null
                    // this will group the list by year descending, essentially creating 1 sort group for each coalesced year
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.HasValue
                        ? x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.Value.Year
                        : x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.HasValue
                            ? x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.Value.Year
                            : int.MinValue, OrderByDirection.Descending },

                    // activities that have both a start date & end date in same year come at the top (true above false)
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.HasValue
                        && x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.HasValue
                        && x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.Value.Year
                            == x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.Value.Year
                        , OrderByDirection.Descending },

                    // activities that have both start & end come at bottom (true below false) because they will not be in same year
                    // after the sort expression above puts ones in same year at the top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.HasValue
                        && x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.HasValue, OrderByDirection.Ascending },

                    // so far all date sorting has been by year: use this to also sort by month & day descending
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn
                        ?? x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn, OrderByDirection.Descending },

                    // finally, sort by title alphabetically
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).Title, OrderByDirection.Ascending },
                };

                CreateMap<MyActivitiesInputModel, MyActivities>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    //.ForMember(d => d.EagerLoad, o => o.UseValue(ActivityApiModel.EagerLoad)) // paged list is faster without eager loading
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.UseValue(defaultOrderBy))
                ;
            }
        }
    }
}