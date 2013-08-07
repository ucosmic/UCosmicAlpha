using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByTypeIdPlaceIdEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int PlaceId { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }

        public ActivityCountByTypeIdPlaceIdEstablishmentId(int inTypeId,
                                                             int inPlaceId,
                                                             int inEstablishmentId,
                                                             DateTime fromDateUtc,
                                                             DateTime toDateUtc)
        {
            TypeId = inTypeId;
            PlaceId = inPlaceId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }
    }

    public class HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<ActivityCountByTypeIdPlaceIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByTypeIdPlaceIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count(
                a => (a.ModeText == publicMode) &&
                     (a.EditSourceId == null) &&
                a.Values.Any(v => (v.Locations.Any(vl => vl.PlaceId == query.PlaceId)) &&
                                  (v.Types.Any(vt => vt.TypeId == query.TypeId))) &&

                    a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId) &&

                    a.Values.Any(v =>
                        /* and, include activities that are undated... */
                        (!v.StartsOn.HasValue && !v.EndsOn.HasValue) ||

                        /* or, there is no start date or there is a start date and its >= the FromDate... */
                        (!v.StartsOn.HasValue || (v.StartsOn.Value >= query.FromDate)) &&

                        /* and, OnGoing has value and true,
                         * or there is no end date, or there is an end date and its earlier than ToDate. */
                        ((v.OnGoing.HasValue && v.OnGoing.Value) ||
                            (!v.EndsOn.HasValue || (v.EndsOn.Value < query.ToDate)))
                        )
                );
        }
    }
}
