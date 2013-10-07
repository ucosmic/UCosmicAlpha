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
                var defaultOrderBy = new Dictionary<Expression<Func<Activity, object>>, OrderByDirection>
                {
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing.HasValue, OrderByDirection.Descending }, // null ongoings at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).OnGoing, OrderByDirection.Descending }, // true ongoings above false ongoings
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn.HasValue, OrderByDirection.Descending }, // null start dates at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn.HasValue, OrderByDirection.Descending }, // null end dates at bottom
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).EndsOn, OrderByDirection.Descending }, // latest ending at top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).StartsOn, OrderByDirection.Descending }, // latest starting at top
                    { x => x.Values.FirstOrDefault(y => y.ModeText == y.Activity.ModeText).Title, OrderByDirection.Ascending }, // title A-Z
                };

                CreateMap<MyActivitiesInputModel, MyActivities>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    //.ForMember(d => d.EagerLoad, o => o.UseValue(ActivityApiModel.EagerLoad))
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.UseValue(defaultOrderBy))
                ;
            }
        }
    }
}