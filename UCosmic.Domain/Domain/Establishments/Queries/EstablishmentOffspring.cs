using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentOffspring : BaseEntitiesQuery<Establishment>, IDefineQuery<IQueryable<Establishment>>
    {
        public EstablishmentOffspring(int ancestorEstablishmentId)
        {
            AncestorEstablishmentId = ancestorEstablishmentId;
        }

        public int AncestorEstablishmentId { get; private set; }
    }

    public class HandleEstablishmentOffspringQuery : IHandleQueries<EstablishmentOffspring, IQueryable<Establishment>>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentOffspringQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<Establishment> Handle(EstablishmentOffspring query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entities = _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Ancestors.Any(y => y.AncestorId == query.AncestorEstablishmentId))
                .OrderBy(query.OrderBy)
            ;

            return entities;
        }
    }
}