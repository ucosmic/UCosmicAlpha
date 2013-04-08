using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByType : BaseEntityQuery<Establishment>, IDefineQuery<Establishment[]>
    {
        public string CategoryCode { get; private set; }

        public EstablishmentsByType(string categoryCode)
        {
            if (string.IsNullOrWhiteSpace(categoryCode))
                throw new ArgumentException("Cannot be empty or white space.", "categoryCode");

            CategoryCode = categoryCode;
        }
    }

    public class HandleEstablishmentsByTypeQuery : IHandleQueries<EstablishmentsByType, Establishment[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentsByTypeQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment[] Handle(EstablishmentsByType query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Establishment>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .Where(x => x.Type.CategoryCode == query.CategoryCode).ToArray();
            ;
        }
    }
}
