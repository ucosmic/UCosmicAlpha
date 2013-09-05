using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleWithActivitiesCountByTypeIdEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime? FromDate { get; private set; }
        public DateTime? ToDate { get; private set; }
        public bool NoUndated { get; private set; }
        public bool IncludeFuture { get; private set; }

        public PeopleWithActivitiesCountByTypeIdEstablishmentId(int inTypeId,
                                                         int inEstablishmentId,
                                                         DateTime? fromDateUtc = null,
                                                         DateTime? toDateUtc = null)
        {
            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            {
                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            }

            TypeId = inTypeId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public PeopleWithActivitiesCountByTypeIdEstablishmentId(int inTypeId,
                                                         int inEstablishmentId,
                                                         DateTime fromDateUtc,
                                                         DateTime toDateUtc,
                                                         bool noUndated,
                                                         bool includeFuture )
        {
            TypeId = inTypeId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandlePeopleWithActivitiesCountByTypeIdEstablishmentIdQuery : IHandleQueries<PeopleWithActivitiesCountByTypeIdEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandlePeopleWithActivitiesCountByTypeIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(PeopleWithActivitiesCountByTypeIdEstablishmentId query)
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
                                                a.TypeIds.Contains(query.TypeId) &&

                                                /* and, EstablishmentId must be found in list of affiliated establishments...*/
                                                a.EstablishmentIds.Contains(query.EstablishmentId))
                                         .GroupBy(g => g.PersonId);

                        count += groups.Count();
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
