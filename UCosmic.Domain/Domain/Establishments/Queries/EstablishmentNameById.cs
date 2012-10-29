using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentNameById : BaseEntityQuery<EstablishmentName>, IDefineQuery<EstablishmentName>
    {
        public EstablishmentNameById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleEstablishmentNameByIdQuery : IHandleQueries<EstablishmentNameById, EstablishmentName>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentNameByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EstablishmentName Handle(EstablishmentNameById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<EstablishmentName>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;

            return result;
        }
    }
}