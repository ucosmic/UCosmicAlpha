using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class ActivityCount : BaseEntityQuery<Place>, IDefineQuery<int>
    {
        public ActivityCount()
        {
        }
    }

    public class HandleActivityCountQuery : IHandleQueries<ActivityCount, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCount query)
        {
            //if (query == null) throw new ArgumentNullException("query");

            //var result =
            //    _entities.Query<Place>()
            //             .Any(
            //                 a =>
            //                 a.Values.Any(v =>
            //                              v.Locations.Any(l =>
            //                                              l.Place.Ancestors.Any(c =>
            //                                                                 c.Ancestor.IsCountry))));
            return 0;
        }
    }
}
