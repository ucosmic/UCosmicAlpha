using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Activities
{
    public class ActivitiesByKeyword : BaseEntitiesQuery<ActivityValues>, IDefineQuery<PagedQueryResult<ActivityValues>>
    {
        public ActivitiesByKeyword()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int? PersonId { get; set; }
        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public string CountryCode { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleActivitiesByKeywordQuery : IHandleQueries<ActivitiesByKeyword, PagedQueryResult<ActivityValues>>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private static readonly string PublicText = ActivityMode.Public.AsSentenceFragment();

        public HandleActivitiesByKeywordQuery(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public PagedQueryResult<ActivityValues> Handle(ActivitiesByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<ActivityValues>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.ModeText == PublicText && x.Activity.ModeText == PublicText && x.Activity.Original == null)
            ;

            if (query.EstablishmentId.HasValue)
            {
                queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == query.EstablishmentId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(query.EstablishmentDomain))
            {
                var establishment = _queryProcessor.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                queryable = queryable.Where(x => x.Activity.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == establishment.RevisionId));
            }

            // when the query's country code is empty string, match all agreements regardless of country.
            // when the query's country code is null, match agreements with partners that have no known country
            if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                queryable = queryable.Where(x => x.Locations.Any(y => y.Place.IsCountry && y.Place.GeoPlanetPlace != null && query.CountryCode.Equals(y.Place.GeoPlanetPlace.Country.Code, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                // SQL Server can't handle a complex query like this with eager loading, so we break it up
                // query locations separately from other fields, then get the id's of each separate query, then union them together
                var nonLocationQueryable = queryable.Where(x => (x.Title != null && x.Title.Contains(query.Keyword))
                    || (x.ContentSearchable != null && x.ContentSearchable.Contains(query.Keyword))
                    || x.Tags.Any(y => y.Text.Contains(query.Keyword))
                    || x.Types.Any(y => y.Type.Type.Contains(query.Keyword))
                );
                var locationQueryable = queryable.Where(x => x.Locations.Any(y => y.Place.OfficialName.Contains(query.Keyword)));
                var nonLocationIds = nonLocationQueryable.Select(x => x.RevisionId);
                var locationIds = locationQueryable.Select(x => x.RevisionId);
                var ids = nonLocationIds.Union(locationIds).Distinct().ToArray();
                queryable = _entities.Query<ActivityValues>().Where(x => ids.Contains(x.RevisionId));
            }

            queryable = queryable.OrderBy(query.OrderBy);

            var result = new PagedQueryResult<ActivityValues>(queryable, query.PageSize, query.PageNumber);
            return result;
        }
    }
}
