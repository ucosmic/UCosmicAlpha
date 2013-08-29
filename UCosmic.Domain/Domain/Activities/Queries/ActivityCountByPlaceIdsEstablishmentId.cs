using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByPlaceIdsEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int[] PlaceIds { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public ActivityCountByPlaceIdsEstablishmentId(int[] inPlaceIds,
                                                      int inEstablishmentId,
                                                      DateTime? fromDateUtc = null,
                                                      DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            PlaceIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByPlaceIdsEstablishmentId(int[] inPlaceIds,
                                                      int inEstablishmentId,
                                                      DateTime fromDateUtc,
                                                      DateTime toDateUtc,
                                                      bool noUndated,
                                                      bool includeFuture)
        {
            PlaceIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandleActivityCountByCountryIdEstablishmentIdQuery : IHandleQueries<ActivityCountByPlaceIdsEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandleActivityCountByCountryIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(ActivityCountByPlaceIdsEstablishmentId query)
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
                        count += view.Count(a =>
                                           /* PlaceId must be found in list placeIds...*/
                                           a.PlaceIds.Any(e => e == placeId) &&

                                           /* and, EstablishmentId must be found in list of affiliated establishments...*/
                                           a.EstablishmentIds.Any(e => e == query.EstablishmentId)
                            );
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
