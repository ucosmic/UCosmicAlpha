using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByEstablishmentId : BaseViewsQuery<ActivityView>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }

        public ActivityCountByEstablishmentId(int inEstablishmentId, DateTime fromDateUtc, DateTime toDateUtc)
        {
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }
    }

    public class HandleActivityCountByEstablishmentIdQuery : IHandleQueries<ActivityCountByEstablishmentId, int>
    {
        private readonly ActivityViewProjector _projector;

        public HandleActivityCountByEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(ActivityCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");
            int count = 0;

            try
            {
                var possibleNullView = _projector.BeginReadView();
                if (possibleNullView != null)
                {
                    var view = possibleNullView.AsQueryable();

                    count = view.Count(a =>
                                       /* EstablishmentId must be found in list of affiliated establishments...*/
                                       a.EstablishmentIds.Any(e => e == query.EstablishmentId) &&

                                       /* and, include activities that are undated... */
                                       ((!a.StartsOn.HasValue && !a.EndsOn.HasValue) ||
                                        /* or */
                                        (
                                            /* there is no start date, or there is a start date and its >= the FromDate... */
                                            (!a.StartsOn.HasValue ||
                                             (a.StartsOn.Value >= query.FromDate)) &&

                                            /* and, OnGoing has value and true,
                                            * or there is no end date, or there is an end date and its earlier than ToDate. */
                                            ((a.OnGoing.HasValue && a.OnGoing.Value) ||
                                             (!a.EndsOn.HasValue ||
                                              (a.EndsOn.Value < query.ToDate)))
                                        ))
                        );
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
