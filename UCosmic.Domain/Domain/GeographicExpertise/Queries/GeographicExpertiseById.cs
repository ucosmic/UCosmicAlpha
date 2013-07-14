using System;
using System.Linq;

namespace UCosmic.Domain.GeographicExpertise
{
    public class GeographicExpertiseById : BaseEntityQuery<GeographicExpertise>, IDefineQuery<GeographicExpertise>
    {
        public int Id { get; private set; }

        public GeographicExpertiseById(int inEntityId)
        {
            Id = inEntityId;
        }
    }

    public class HandleGeographicExpertiseByIdQuery : IHandleQueries<GeographicExpertiseById, GeographicExpertise>
    {
        private readonly IQueryEntities _entities;

        public HandleGeographicExpertiseByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public GeographicExpertise Handle(GeographicExpertiseById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<GeographicExpertise>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id);

            return result;
        }
    }
}
