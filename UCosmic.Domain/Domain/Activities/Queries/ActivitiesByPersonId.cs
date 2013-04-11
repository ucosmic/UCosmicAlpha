using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByPersonId : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public int PersonId { get; set; }
        public string ModeText { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleActivitiesByPersonIdQuery : IHandleQueries<ActivitiesByPersonId, PagedQueryResult<Activity>>
    {
        private readonly IQueryEntities _entities;

        public HandleActivitiesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Activity> Handle(ActivitiesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            /* Order as follows:
             *  If date(s) exist, order by:
             *      if toDate exists, sort most recent first
             *      else, use fromData
             *  then by Type(s?) using order in employee module
             *  then alphabetically by title
             *  
             *  activities with no dates are listed last
             */

            /* TBD - If I run each query separately,I get the correct results.  However,
             * when I .Concat the results, the undated activities are appeneded, but the
             * sort order of both results has changed.
             */

            IQueryable<Activity> undatedResults = _entities.Query<Activity>()
                                                           .Where(
                                                               a =>
                                                               !a.Values.FirstOrDefault().StartsOn.HasValue &&
                                                               !a.Values.FirstOrDefault().EndsOn.HasValue)
                                                           .WithPersonId(query.PersonId)
                                                           .WithMode(query.ModeText)
                                                           .OrderBy(a => a.Values.FirstOrDefault().Title);

            IQueryable<Activity> results = _entities.Query<Activity>()
                                                    .Where(
                                                        a =>
                                                        (a.Values.FirstOrDefault().StartsOn.HasValue) ||
                                                        (a.Values.FirstOrDefault().EndsOn.HasValue))
                                                    .WithPersonId(query.PersonId)
                                                    .WithMode(query.ModeText)
                                                    .OrderByDescending(
                                                        a =>
                                                        a.Values.FirstOrDefault().EndsOn.HasValue
                                                            ? a.Values.FirstOrDefault().EndsOn.Value
                                                            : a.Values.FirstOrDefault().StartsOn.Value)
                                                    .ThenBy(a => a.Values.FirstOrDefault().Title)
                                                    .Concat(undatedResults);

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
