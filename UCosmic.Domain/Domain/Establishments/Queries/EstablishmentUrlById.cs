using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentUrlById : BaseEntityQuery<EstablishmentUrl>, IDefineQuery<EstablishmentUrl>
    {
        public EstablishmentUrlById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleEstablishmentUrlByIdQuery : IHandleQueries<EstablishmentUrlById, EstablishmentUrl>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentUrlByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EstablishmentUrl Handle(EstablishmentUrlById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<EstablishmentUrl>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;

            return result;
        }
    }
}