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
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing, OrderByDirection.Descending },
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn
                        ?? x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn, OrderByDirection.Descending },
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