using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByPlaceId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int PlaceId { get; private set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }

        public ActivityCountByPlaceId(int placeId, DateTime fromDateUtc, DateTime toDateUtc)
        {
            PlaceId = placeId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }
    }

    public class HandleActivityCountByLocationQuery : IHandleQueries<ActivityCountByPlaceId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountByLocationQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByPlaceId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count( a => 

                    /* Include all activities in count that are public... */
                    (a.ModeText == publicMode) &&
                    /* and, there is no edit source (don't include edit copies)... */
                    (a.EditSourceId == null) &&
                    
                    a.Values.Any( v =>
                        /* and, the locations include the country we want... */
                        v.Locations.Any(l => l.Place.RevisionId == query.PlaceId)) &&

                    a.Values.Any( v =>                        
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
