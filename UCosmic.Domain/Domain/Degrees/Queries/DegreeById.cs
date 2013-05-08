using System;
using System.Linq;

namespace UCosmic.Domain.Degrees
{
    public class DegreeById : BaseEntityQuery<Degree>, IDefineQuery<Degree>
    {
        public int Id { get; private set; }

        public DegreeById(int inEntityId)
        {
            Id = inEntityId;
        }
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
                .SingleOrDefault(x => x.RevisionId == query.Id);

            return result;
        }
    }
}
