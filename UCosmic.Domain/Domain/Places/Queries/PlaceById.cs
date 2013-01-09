using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class PlaceById : BaseEntityQuery<Place>, IDefineQuery<Place>
    {
        public PlaceById(int placeId)
        {
            if (placeId < 1)
                throw new ArgumentException(string.Format("Place ID '{0}' is not valid.", placeId), "placeId");
            Id = placeId;
        }

        public int Id { get; private set; }
    }

    public class HandlePlaceByIdQuery : IHandleQueries<PlaceById, Place>
    {
        private readonly IQueryEntities _entities;

        public HandlePlaceByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Place Handle(PlaceById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;

            return result;
        }
    }
}