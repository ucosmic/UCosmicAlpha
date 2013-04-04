using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByPersonIdMode : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public int PersonId { get; private set; }
        public string ModeText { get; private set; }
        public int PageSize { get; private set; }
        public int PageNumber { get; private set; }
    }

    public class HandleActivitiesByPersonIdModeQuery : IHandleQueries<ActivitiesByPersonIdMode, PagedQueryResult<Activity>>
    {
        private readonly IQueryEntities _entities;

        public HandleActivitiesByPersonIdModeQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Activity> Handle(ActivitiesByPersonIdMode query)
        {
            if (query == null) throw new ArgumentNullException("query");

            IQueryable<Activity> results;

            if (!String.IsNullOrEmpty(query.ModeText))
            {
               results = _entities.Query<Activity>()
                         .WithPersonId(query.PersonId)
                         .WithMode(query.ModeText)
                         .OrderBy(query.OrderBy);
            }
            else
            {
                results = _entities.Query<Activity>()
                          .WithPersonId(query.PersonId)
                          .OrderBy(query.OrderBy);                
            }

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
