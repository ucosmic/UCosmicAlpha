using System;
using System.Linq;

namespace UCosmic.Domain.GeographicExpertises
{
    public class GeographicExpertisesByPersonId : BaseEntitiesQuery<GeographicExpertise>, IDefineQuery<PagedQueryResult<GeographicExpertise>>
    {
        public int PersonId { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleGeographicExpertisesByPersonIdQuery : IHandleQueries<GeographicExpertisesByPersonId, PagedQueryResult<GeographicExpertise>>
    {
        private readonly IQueryEntities _entities;

        public HandleGeographicExpertisesByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public PagedQueryResult<GeographicExpertise> Handle(GeographicExpertisesByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            IQueryable<GeographicExpertise> results = _entities.Query<GeographicExpertise>()
                                                  .Where(a => a.PersonId == query.PersonId)
                                                  .OrderBy(a => a.Locations.FirstOrDefault().Place.OfficialName);

            var pagedResults = new PagedQueryResult<GeographicExpertise>(results, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
