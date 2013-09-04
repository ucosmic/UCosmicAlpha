using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByPlaceIds : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int[] PlaceIds { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public ActivityCountByPlaceIds(int placeId,
                                      DateTime? fromDateUtc = null,
                                      DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            PlaceIds = new int[] { placeId };
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByPlaceIds(int[] placeIds,
                                      DateTime? fromDateUtc = null,
                                      DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            PlaceIds = placeIds;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByPlaceIds(int[] placeIds,
                                      DateTime fromDateUtc,
                                      DateTime toDateUtc,
                                      bool noUndated,
                                      bool includeFuture )
        {
            PlaceIds = placeIds;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandleActivityCountByLocationQuery : IHandleQueries<ActivityCountByPlaceIds, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandleActivityCountByLocationQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(ActivityCountByPlaceIds query)
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

                    foreach (var placeId in query.PlaceIds)
                    {
                        count += view.Count(a => a.PlaceIds.Contains(placeId));
                    }
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
