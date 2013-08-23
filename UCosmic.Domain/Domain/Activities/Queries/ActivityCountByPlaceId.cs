using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByPlaceId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int PlaceId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public ActivityCountByPlaceId(int placeId,
                                      DateTime? fromDateUtc = null,
                                      DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            PlaceId = placeId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByPlaceId(int placeId,
                                      DateTime fromDateUtc,
                                      DateTime toDateUtc,
                                      bool noUndated,
                                      bool includeFuture )
        {
            PlaceId = placeId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandleActivityCountByLocationQuery : IHandleQueries<ActivityCountByPlaceId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandleActivityCountByLocationQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(ActivityCountByPlaceId query)
        {
            if (query == null) throw new ArgumentNullException("query");
            int count = 0;

            try
            {
                var possibleNullView = _projector.BeginReadView();
                if (possibleNullView != null)
                {
                    var view = possibleNullView.AsQueryable();

                    if (query.FromDate.HasValue && query.ToDate.HasValue)
                    {
                        view = view.ApplyDateRange(query.FromDate.Value,
                                                   query.ToDate.Value,
                                                   query.NoUndated,
                                                   query.IncludeFuture);
                    }

                    count = view.Count(a => a.PlaceIds.Any(e => e == query.PlaceId) );
                }
            }
            finally
            {
                _projector.EndReadView();
            }

            return count;
        }
    }
}
