using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleWithActivitiesCountByTypeIdPlaceIdEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int PlaceId { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public PeopleWithActivitiesCountByTypeIdPlaceIdEstablishmentId(int inTypeId,
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
            PlaceId = inPlaceId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public PeopleWithActivitiesCountByTypeIdPlaceIdEstablishmentId(int inTypeId,
                                                         int inPlaceId,
                                                         int inEstablishmentId,
                                                         DateTime fromDateUtc,
                                                         DateTime toDateUtc,
                                                         bool noUndated,
                                                         bool includeFuture )
        {
            TypeId = inTypeId;
            PlaceId = inPlaceId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandlePeopleWithActivitiesCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<PeopleWithActivitiesCountByTypeIdPlaceIdEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandlePeopleWithActivitiesCountByTypeIdCountryIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(PeopleWithActivitiesCountByTypeIdPlaceIdEstablishmentId query)
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

                    var groups = view.Where(a =>
                                            /* TypeId must be found in typeIds */
                                            a.TypeIds.Any(t => t == query.TypeId) &&

                                            /* and, PlaceId must be found in list placeIds...*/
                                            a.PlaceIds.Any(e => e == query.PlaceId) &&

                                            /* and, EstablishmentId must be found in list of affiliated establishments...*/
                                            a.EstablishmentIds.Any(e => e == query.EstablishmentId))
                                     .GroupBy(g => g.PersonId);

                    count = groups.Count();
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
