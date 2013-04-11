using System;
using System.Linq;

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

            IQueryable<Activity> results;

            /* Order as follows:
             *  If date(s) exist, order by:
             *      if toDate exists, sort most recent first
             *      else, use fromData
             *  then by Type using order in employee module
             *  then alphabetically by title
             *  
             *  activities with no dates are listed last
             */

            results = _entities.Query<Activity>()
                        .WithPersonId(query.PersonId)
                        .WithMode(query.ModeText)
                        .OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
