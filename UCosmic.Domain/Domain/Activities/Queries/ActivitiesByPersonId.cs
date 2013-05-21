using System;
using System.Linq;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByPersonId : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public int PersonId { get; set; }
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
             *  All ongoing first by fromDate, then title
             *  If date(s) exist, order by:
             *      if toDate exists, sort most recent first else, use fromData
             *          then alphabetically by title
             *  
             *  Activities with no dates are listed last
             */

            IQueryable<Activity> undatedResults = _entities.Query<Activity>()
                                                           .Where(
                                                               a =>
                                                               a.Values.Any(v => (v.ModeText == a.ModeText) &&
                                                               !v.StartsOn.HasValue && !v.EndsOn.HasValue) &&
                                                               (a.EditSourceId == null)
                                                            )
                                                           .WithPersonId(query.PersonId)
                                                           .OrderBy(a => a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).Title)
                                                           .ToArray().AsQueryable();

            IQueryable<Activity> datedResults = _entities.Query<Activity>()
                                                         .Where(
                                                             a =>
                                                             a.Values.Any(v => (!v.OnGoing.HasValue || !v.OnGoing.Value) &&
                                                                               (v.ModeText == a.ModeText) &&
                                                                               (v.StartsOn.HasValue || v.EndsOn.HasValue)) &&
                                                                               (a.EditSourceId == null)
                                                          )
                                                         .WithPersonId(query.PersonId)
                                                         .OrderByDescending(a =>
                                                             a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).EndsOn.HasValue
                                                                 ? a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).EndsOn.Value
                                                                 : a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).StartsOn.Value)
                                                         .ThenBy(a => a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).Title)
                                                         .ToArray().AsQueryable();

            IQueryable<Activity> results = _entities.Query<Activity>()
                                                           .Where(
                                                               a =>
                                                               a.Values.Any(v => v.OnGoing.HasValue && v.OnGoing.Value) &&
                                                               (a.EditSourceId == null)
                                                            )
                                                           .WithPersonId(query.PersonId)
                                                           .OrderByDescending(a => a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).StartsOn.Value)
                                                           .ThenBy(a => a.Values.FirstOrDefault(v => v.ModeText == a.ModeText).Title)
                                                           .ToArray().AsQueryable()
                                                           .Concat(datedResults)
                                                           .Concat(undatedResults);


            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
