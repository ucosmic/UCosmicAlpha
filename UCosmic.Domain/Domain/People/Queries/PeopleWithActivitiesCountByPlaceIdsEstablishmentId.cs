using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleWithActivitiesCountByPlaceIdsEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int[] PlaceIds { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public PeopleWithActivitiesCountByPlaceIdsEstablishmentId(int inPlaceId,
                                                     int inEstablishmentId,
                                                     DateTime? fromDateUtc = null,
                                                     DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            PlaceIds = new int[] { inPlaceId };
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public PeopleWithActivitiesCountByPlaceIdsEstablishmentId(int[] inPlaceIds,
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

        public PeopleWithActivitiesCountByPlaceIdsEstablishmentId(int[] inPlaceIds,
                                                     int inEstablishmentId,
                                                     DateTime fromDateUtc,
                                                     DateTime toDateUtc,
                                                     bool noUndated,
                                                     bool includeFuture )
        {
            PlaceIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandlePeopleWithActivitiesCountByCountryIdEstablishmentIdQuery : IHandleQueries<PeopleWithActivitiesCountByPlaceIdsEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandlePeopleWithActivitiesCountByCountryIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(PeopleWithActivitiesCountByPlaceIdsEstablishmentId query)
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
                        var groups = view.Where(a =>
                                                /* PlaceId must be found in list placeIds...*/
                                                a.PlaceIds.Contains(placeId) &&

                                                /* and, EstablishmentId must be found in list of affiliated establishments...*/
                                                a.EstablishmentIds.Contains(query.EstablishmentId))
                                         .GroupBy(g => g.PersonId);

                        count += groups.Count();
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
