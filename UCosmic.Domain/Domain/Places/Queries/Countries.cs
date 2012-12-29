using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class Countries : BaseEntitiesQuery<Place>, IDefineQuery<Place[]>
    {
    }

    public class HandleCountriesQuery : IHandleQueries<Countries, Place[]>
    {
        private readonly IQueryEntities _entities;

        public HandleCountriesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Place[] Handle(Countries query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.IsCountry)
                .OrderBy(query.OrderBy)
            ;

            return results.ToArray();
        }
    }
}