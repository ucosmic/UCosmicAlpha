using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByTypeIdPlaceIdsEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int[] PlaceIds { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public ActivityCountByTypeIdPlaceIdsEstablishmentId(int inTypeId,
                                                             int inPlaceId,
                                                             int inEstablishmentId,
                                                             DateTime? fromDateUtc = null,
                                                             DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }


            TypeId = inTypeId;
            PlaceIds = new int[] { inPlaceId };
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByTypeIdPlaceIdsEstablishmentId(int inTypeId,
                                                             int[] inPlaceIds,
                                                             int inEstablishmentId,
                                                             DateTime? fromDateUtc = null,
                                                             DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }


            TypeId = inTypeId;
            PlaceIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivityCountByTypeIdPlaceIdsEstablishmentId(int inTypeId,
                                                             int[] inPlaceIds,
                                                             int inEstablishmentId,
                                                             DateTime fromDateUtc,
                                                             DateTime toDateUtc,
                                                             bool noUndated,
                                                             bool includeFuture)
        {
            TypeId = inTypeId;
            PlaceIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<ActivityCountByTypeIdPlaceIdsEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(ActivityCountByTypeIdPlaceIdsEstablishmentId query)
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
                                           /* TypeId must be found in typeIds */
                                           a.TypeIds.Any(t => t == query.TypeId) &&

                                           /* and, PlaceId must be found in placeIds...*/
                                           a.PlaceIds.Any(e => e == placeId) &&

                                           /* and, EstablishmentId must be found in establishmentids*/
                                           a.EstablishmentIds.Any(e => e == query.EstablishmentId));
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
