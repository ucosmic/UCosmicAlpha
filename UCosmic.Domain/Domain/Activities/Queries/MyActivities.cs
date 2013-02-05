using System;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class MyActivities : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public IPrincipal Principal { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleMyActivitiesQuery : IHandleQueries<MyActivities, PagedQueryResult<Activity>>
    {
        private readonly IQueryEntities _entities;

        public HandleMyActivitiesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Activity> Handle(MyActivities query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .WithUserName(query.Principal.Identity.Name)
                .OrderBy(query.OrderBy)
            ;

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
