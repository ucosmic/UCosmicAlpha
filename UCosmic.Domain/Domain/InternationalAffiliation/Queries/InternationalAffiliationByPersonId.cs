using System;
using System.Linq;

namespace UCosmic.Domain.InternationalAffiliations
{
    public class InternationalAffiliationsByPersonId : BaseEntitiesQuery<InternationalAffiliation>, IDefineQuery<PagedQueryResult<InternationalAffiliation>>
    {
        public int PersonId { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleInternationalAffiliationsByPersonIdQuery : IHandleQueries<InternationalAffiliationsByPersonId, PagedQueryResult<InternationalAffiliation>>
    {
        private readonly IQueryEntities _entities;

        public HandleInternationalAffiliationsByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<InternationalAffiliation> Handle(InternationalAffiliationsByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            IQueryable<InternationalAffiliation> results = _entities.Query<InternationalAffiliation>()
                                                  .Where(a => a.PersonId == query.PersonId)
                                                  .OrderBy(a => a.Locations.FirstOrDefault().Place.OfficialName);

            var pagedResults = new PagedQueryResult<InternationalAffiliation>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
