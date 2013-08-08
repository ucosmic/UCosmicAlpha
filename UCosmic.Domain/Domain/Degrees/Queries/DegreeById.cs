using System;
using System.Linq;

namespace UCosmic.Domain.Degrees
{
    public class DegreeById : BaseEntityQuery<Degree>, IDefineQuery<Degree>
    {
        public DegreeById(int degreeId, int? personId = null)
        {
            DegreeId = degreeId;
            PersonId = personId;
        }

        public int DegreeId { get; private set; }
        public int? PersonId { get; private set; }
    }

    public class HandleDegreeByIdQuery : IHandleQueries<DegreeById, Degree>
    {
        private readonly IQueryEntities _entities;

        public HandleDegreeByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Degree Handle(DegreeById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Degree>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.DegreeId);

            if (query.PersonId.HasValue && result != null && result.PersonId != query.PersonId.Value)
                result = null;

            return result;
        }
    }
}
