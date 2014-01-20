using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Degrees
{
    public class DegreesPageByTerms : BaseEntitiesQuery<Degree>, IDefineQuery<PagedQueryResult<Degree>>
    {
        public DegreesPageByTerms()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public int? EstablishmentId { get; set; }
        public string EstablishmentDomain { get; set; }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleDegreesPageByTermsQuery : IHandleQueries<DegreesPageByTerms, PagedQueryResult<Degree>>
    {
        private readonly IProcessQueries _queries;
        private readonly IQueryEntities _entities;

        public HandleDegreesPageByTermsQuery(IProcessQueries queries, IQueryEntities entities)
        {
            _queries = queries;
            _entities = entities;
        }

        public PagedQueryResult<Degree> Handle(DegreesPageByTerms query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Degree>()
                .EagerLoad(_entities, query.EagerLoad);

            if (query.EstablishmentId.HasValue)
            {
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == query.EstablishmentId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(query.EstablishmentDomain))
            {
                var establishment = _queries.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                queryable = queryable.Where(x => x.Person.Affiliations.Any(y => y.IsDefault && y.EstablishmentId == establishment.RevisionId));
            }

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Degree>(queryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
