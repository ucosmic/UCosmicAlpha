using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentUrls : BaseEntitiesQuery<EstablishmentUrl>, IDefineQuery<EstablishmentUrl[]>
    {
        public EstablishmentUrls(int? establishmentId = null)
        {
            EstablishmentId = establishmentId;
        }

        public int? EstablishmentId { get; private set; }
    }

    public class HandleEstablishmentUrlsQuery : IHandleQueries<EstablishmentUrls, EstablishmentUrl[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentUrlsQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EstablishmentUrl[] Handle(EstablishmentUrls query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<EstablishmentUrl>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => query.EstablishmentId.HasValue
                    ? x.ForEstablishment.RevisionId == query.EstablishmentId.Value
                    : x.RevisionId != 0)
                .OrderBy(query.OrderBy)
            ;

            return results.ToArray();
        }
    }
}