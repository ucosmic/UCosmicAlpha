using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentChildren : BaseEntitiesQuery<Establishment>, IDefineQuery<Establishment[]>
    {
        public EstablishmentChildren(int parentEstablishmentId)
        {
            ParentEstablishmentId = parentEstablishmentId;
        }

        public int ParentEstablishmentId { get; private set; }
    }

    public class HandleEstablishmentChildrenQuery : IHandleQueries<EstablishmentChildren, Establishment[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentChildrenQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment[] Handle(EstablishmentChildren query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entities = _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Parent != null && x.Parent.RevisionId == query.ParentEstablishmentId)
                .OrderBy(query.OrderBy)
            ;

            return entities.ToArray();
        }
    }
}