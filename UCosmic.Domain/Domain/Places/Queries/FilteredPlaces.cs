using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class FilteredPlaces : BaseEntitiesQuery<Place>, IDefineQuery<Place[]>
    {
        public int? ParentId { get; set; }
        public bool? IsCountry { get; set; }
        public bool? IsContinent { get; set; }
        public bool? IsWater { get; set; }
        public bool? IsEarth { get; set; }
        public bool? IsAdmin1 { get; set; }
        public bool? IsAdmin2 { get; set; }
        public bool? IsAdmin3 { get; set; }
    }

    public class HandleFilteredPlacesQuery : IHandleQueries<FilteredPlaces, Place[]>
    {
        private readonly IQueryEntities _entities;

        public HandleFilteredPlacesQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Place[] Handle(FilteredPlaces query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
            ;

            if (query.ParentId.HasValue)
                results = results.Where(x => x.Parent != null && x.Parent.RevisionId == query.ParentId.Value);

            if (query.IsContinent.HasValue)
                results = results.Where(x => x.IsContinent == query.IsContinent.Value);

            if (query.IsCountry.HasValue)
                results = results.Where(x => x.IsCountry == query.IsCountry.Value);

            if (query.IsAdmin1.HasValue)
                results = results.Where(x => x.IsAdmin1 == query.IsAdmin1.Value);

            if (query.IsAdmin2.HasValue)
                results = results.Where(x => x.IsAdmin2 == query.IsAdmin2.Value);

            if (query.IsAdmin3.HasValue)
                results = results.Where(x => x.IsAdmin3 == query.IsAdmin3.Value);

            if (query.IsWater.HasValue)
                results = results.Where(x => x.IsWater == query.IsWater.Value);

            results = results.OrderBy(query.OrderBy);

            return results.ToArray();
        }
    }
}