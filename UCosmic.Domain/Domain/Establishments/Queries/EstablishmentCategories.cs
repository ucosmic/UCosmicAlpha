using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentCategories : BaseEntitiesQuery<EstablishmentCategory>, IDefineQuery<EstablishmentCategory[]>
    {
    }

    public class HandleEstablishmentCategoriesQuery : IHandleQueries<EstablishmentCategories, EstablishmentCategory[]>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentCategoriesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EstablishmentCategory[] Handle(EstablishmentCategories query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entities = _entities.Query<EstablishmentCategory>()
                .EagerLoad(_entities, query.EagerLoad)
            ;

            return entities.ToArray();
        }
    }
}
