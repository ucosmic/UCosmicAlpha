using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentById : BaseEntityQuery<Establishment>, IDefineQuery<Establishment>
    {
        public EstablishmentById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleEstablishmentByIdQuery : IHandleQueries<EstablishmentById, Establishment>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment Handle(EstablishmentById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;

            return result;
        }
    }
}