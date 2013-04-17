using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class PlaceByWoeId : BaseEntityQuery<Place>, IDefineQuery<Place>
    {
        public PlaceByWoeId(int woeId, int? geoNameId = null)
        {
            WoeId = woeId;
            GeoNameId = geoNameId;
        }

        public int WoeId { get; private set; }
        public int? GeoNameId { get; private set; }
    }

    public class HandlePlaceByWoeIdQuery : IHandleQueries<PlaceByWoeId, Place>
    {
        private static readonly object Lock = new object();
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdatePlaceHierarchy> _updateHierarchy;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePlaceByWoeIdQuery(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<UpdatePlaceHierarchy> updateHierarchy
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _updateHierarchy = updateHierarchy;
            _unitOfWork = unitOfWork;
        }

        public Place Handle(PlaceByWoeId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            lock (Lock)
            {
                // first look in the db
                var place = _entities.Get<Place>()
                    .EagerLoad(_entities, query.EagerLoad)
                    .ByWoeId(query.WoeId)
                ;
                if (place != null) return place;

                // load WOE from storage
                var woe = _queryProcessor.Execute(new SingleGeoPlanetPlace(query.WoeId));

                // convert to entity
                place = woe.ToPlace();

                // continent Australia should be named Oceania
                if (woe.IsContinent && woe.EnglishName == "Australia")
                    place.OfficialName = "Oceania";

                // try to match to geonames
                if (place.GeoNamesToponym == null && place.GeoPlanetPlace != null)
                {
                    var geoNameId = query.GeoNameId ?? _queryProcessor.Execute(
                        new GeoNameIdByWoeId(place.GeoPlanetPlace.WoeId));
                    if (geoNameId.HasValue)
                    {
                        place.GeoNamesToponym = _queryProcessor.Execute(
                            new SingleGeoNamesToponym(geoNameId.Value));
                        if (place.GeoNamesToponym != null)
                        {
                            place.Names = place.GeoNamesToponym.AlternateNames.ToEntities(_entities);
                        }
                    }
                }

                // configure hierarchy
                if (woe.Parent != null)
                {
                    place.Parent = Handle(new PlaceByWoeId(woe.Parent.WoeId));
                }

                // when no parent exists, map country to continent
                else if (woe.IsCountry)
                {
                    if (place.GeoNamesToponym != null)
                    {
                        var geoNamesContinent =
                            place.GeoNamesToponym.Ancestors.Select(a => a.Ancestor)
                                .SingleOrDefault(
                                    g =>
                                        g.FeatureCode == GeoNamesFeatureEnum.Continent.GetCode() &&
                                        g.Feature.ClassCode == GeoNamesFeatureClassEnum.Area.GetCode());
                        if (geoNamesContinent != null)
                        {
                            place.Parent = _queryProcessor.Execute(
                                new PlaceByGeoNameId(geoNamesContinent.GeoNameId));
                        }
                    }
                    else
                    {
                        var geoPlanetContinent = woe.BelongTos.Select(b => b.BelongsTo)
                            .FirstOrDefault(c => c.Type.Code == (int)GeoPlanetPlaceTypeEnum.Continent);
                        if (geoPlanetContinent != null)
                        {
                            place.Parent = Handle(new PlaceByWoeId(geoPlanetContinent.WoeId));
                        }
                    }
                }

                // when no parent exists, map continents & bodies of water to earth
                else if (woe.IsContinent || woe.IsWater)
                {
                    place.Parent = Handle(new PlaceByWoeId(GeoPlanetPlace.EarthWoeId));
                }

                // map ancestors
                _updateHierarchy.Handle(new UpdatePlaceHierarchy(place));

                // add to db & save
                _entities.Create(place);
                _unitOfWork.SaveChanges();

                return place;
            }
        }
    }
}
