using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class ActivityValuesPageBy : BaseEntitiesQuery<ActivityValues>, IDefineQuery<PagedQueryResult<ActivityValues>>
    {
        public ActivityValuesPageBy()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public IPrincipal Principal { get; set; }
        public int? PersonId { get; set; }

        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public int[] PlaceIds { get; set; }
        public string CountryCode { get; set; }
        public int[] ActivityTypeIds { get; set; }
        public DateTime? Since { get; set; }
        public DateTime? Until { get; set; }
        public bool? IncludeUndated { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleActivityValuesPageByQuery : IHandleQueries<ActivityValuesPageBy, PagedQueryResult<ActivityValues>>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleActivityValuesPageByQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PagedQueryResult<ActivityValues> Handle(ActivityValuesPageBy query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _queryProcessor.Execute(new ActivityValuesBy
            {
                PersonId = query.PersonId,
                Principal = query.Principal,
                PlaceIds = query.PlaceIds,
                CountryCode = query.CountryCode,
                ActivityTypeIds = query.ActivityTypeIds,
                Since = query.Since,
                Until = query.Until,
                IncludeUndated = query.IncludeUndated,
                EstablishmentDomain = query.EstablishmentDomain,
                EstablishmentId = query.EstablishmentId,
                Keyword = query.Keyword,
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
            });

            if (query.OrderBy == null || !query.OrderBy.Any())
                queryable = queryable.OrderBy(x => x.RevisionId);
            var result = new PagedQueryResult<ActivityValues>(queryable, query.PageSize, query.PageNumber);
            return result;
        }
    }
}
