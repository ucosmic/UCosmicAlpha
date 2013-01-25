using System;

namespace UCosmic.Domain.Places
{
    public class SingleGeoNamesFeature : IDefineQuery<GeoNamesFeature>
    {
        public SingleGeoNamesFeature(string code)
        {
            Code = code;
        }

        public string Code { get; private set; }
    }

    public class HandleSingleGeoNamesFeatureQuery : IHandleQueries<SingleGeoNamesFeature, GeoNamesFeature>
    {
        private readonly ICommandEntities _entities;

        public HandleSingleGeoNamesFeatureQuery(ICommandEntities entities)
        {
            _entities = entities;
        }

        public GeoNamesFeature Handle(SingleGeoNamesFeature query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.FindByPrimaryKey<GeoNamesFeature>(query.Code);
            return result;
        }
    }
}
