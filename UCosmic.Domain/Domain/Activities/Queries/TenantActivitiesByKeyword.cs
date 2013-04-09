using System;

namespace UCosmic.Domain.Activities
{
    public class TenantActivitiesByKeyword : BaseEntitiesQuery<Activity>, IDefineQuery<PagedQueryResult<Activity>>
    {
        public object Tenant { get; set; }
        public string Keyword { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleTenantActivitiesByKeywordQuery : IHandleQueries<TenantActivitiesByKeyword, PagedQueryResult<Activity>>
    {
        private readonly IQueryEntities _entities;

        public HandleTenantActivitiesByKeywordQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Activity> Handle(TenantActivitiesByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Activity>()
                .EagerLoad(_entities, query.EagerLoad)
                .WithTenant(query.Tenant)
                .WithMode(ActivityMode.Public.AsSentenceFragment())
                .WithKeyword(ActivityMode.Public.AsSentenceFragment(), query.Keyword)
                .OrderBy(query.OrderBy)
            ;

            var pagedResults = new PagedQueryResult<Activity>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
