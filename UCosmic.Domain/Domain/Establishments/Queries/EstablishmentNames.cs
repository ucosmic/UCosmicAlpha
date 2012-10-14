using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentNames : BaseEntitiesQuery<EstablishmentName>, IDefineQuery<EstablishmentName[]>
    {
        public EstablishmentNames(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public int EstablishmentId { get; private set; }
    }

    public class HandleEstablishmentNamesQuery : IHandleQueries<EstablishmentNames, EstablishmentName[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentNamesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EstablishmentName[] Handle(EstablishmentNames query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<EstablishmentName>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.ForEstablishment.RevisionId == query.EstablishmentId)
                .OrderBy(query.OrderBy)
            ;

            return results.ToArray();
        }
    }
}