using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class MyActivities : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public MyActivities(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
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

            var queryable = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Person.User != null &&
                    x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase) &&
                    x.Values.Any(y => y.ModeText == x.ModeText) && x.Original == null)
                .OrderBy(query.OrderBy)
            ;

            var pagedResults = new PagedQueryResult<Activity>(queryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
