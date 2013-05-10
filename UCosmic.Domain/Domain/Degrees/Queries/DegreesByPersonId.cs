using System;
using System.Linq;

namespace UCosmic.Domain.Degrees
{
    public class DegreesByPersonId : BaseEntitiesQuery<Degree>, IDefineQuery<PagedQueryResult<Degree>>
    {
        public int PersonId { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleDegreesByPersonIdQuery : IHandleQueries<DegreesByPersonId, PagedQueryResult<Degree>>
    {
        private readonly IQueryEntities _entities;

        public HandleDegreesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<Degree> Handle(DegreesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            IQueryable<Degree> results = _entities.Query<Degree>()
                                                  .Where(a => a.PersonId == query.PersonId)
                                                  .OrderBy(a => a.RevisionId);

            var pagedResults = new PagedQueryResult<Degree>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
