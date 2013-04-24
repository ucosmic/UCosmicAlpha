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
             *  If date(s) exist, order by:
             *      if toDate exists, sort most recent first
             *      else, use fromData
             *  then by Type(s?) using order in employee module
             *  then alphabetically by title
             *  
             *  activities with no dates are listed last
             */

            var employeeActivityTypesList = _entities.Query<EmployeeActivityType>().ToArray().AsQueryable();

            IQueryable<Activity> undatedResults = _entities.Query<Activity>()
                                                           .Where(
                                                               a =>
                                                               a.Values.Any(v => (v.ModeText == a.ModeText) && 
                                                               !v.StartsOn.HasValue && !v.EndsOn.HasValue) &&
                                                               (a.EditSourceId == null)
                                                            )
                                                           .WithPersonId(query.PersonId)
                                                           .OrderBy(a => a.Values.FirstOrDefault().Title)
                                                           //.ThenBy(x => x.Values.FirstOrDefault().Types.Select(y => y.Type).OrderBy(y => y.Rank).FirstOrDefault())
                                                           .ToArray().AsQueryable();

            IQueryable<Activity> results = _entities.Query<Activity>()
                                                    .Where(
                                                        a =>
                                                        a.Values.Any(v => (v.ModeText == a.ModeText) && 
                                                        (v.StartsOn.HasValue || v.EndsOn.HasValue)) &&
                                                        (a.EditSourceId == null)
                                                    )
                                                    .WithPersonId(query.PersonId)
                                                    .OrderByDescending(
                                                        a =>
                                                        a.Values.FirstOrDefault().EndsOn.HasValue
                                                            ? a.Values.FirstOrDefault().EndsOn.Value
                                                            : a.Values.FirstOrDefault().StartsOn.Value)
                                                    .ThenBy(a => a.Values.FirstOrDefault().Title)
                                                    //.ThenBy(x => x.Values.FirstOrDefault().Types.Select(y => y.Type).OrderBy(y => y.Rank).FirstOrDefault())
                                                    .ToArray().AsQueryable()
                                                    .Concat(undatedResults);

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
