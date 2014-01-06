using System;

namespace UCosmic.Domain.Activities
{
    public class ActivityValuesPageByTerms : BaseEntitiesQuery<ActivityValues>, IDefineQuery<PagedQueryResult<ActivityValues>>
    {
        public ActivityValuesPageByTerms()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int? PersonId { get; set; }
        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public int[] PlaceIds { get; set; }
        public int[] ActivityTypeIds { get; set; }
        //public string CountryCode { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleActivityValuesPageByTermsQuery : IHandleQueries<ActivityValuesPageByTerms, PagedQueryResult<ActivityValues>>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private static readonly string PublicText = ActivityMode.Public.AsSentenceFragment();

        public HandleActivityValuesPageByTermsQuery(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public PagedQueryResult<ActivityValues> Handle(ActivityValuesPageByTerms query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _queryProcessor.Execute(new ActivityValuesByTerms
            {
                PlaceIds = query.PlaceIds,
                //CountryCode = query.CountryCode,
                ActivityTypeIds = query.ActivityTypeIds,
                EstablishmentDomain = query.EstablishmentDomain,
                EstablishmentId = query.EstablishmentId,
                Keyword = query.Keyword,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
            });

            queryable = queryable.EagerLoad(_entities, query.EagerLoad).OrderBy(query.OrderBy);

            var result = new PagedQueryResult<ActivityValues>(queryable, query.PageSize, query.PageNumber);
            return result;
        }
    }
}
