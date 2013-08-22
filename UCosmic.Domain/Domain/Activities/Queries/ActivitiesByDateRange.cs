using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    /* Return all activities that fall within FromDate <= date < ToDate */
    public class ActivitiesByDateRange : BaseViewsQuery<ActivityView>, IDefineQuery<IQueryable<ActivityView>>
    {
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }
        public bool NoUndated { get; set; }
        public bool IncludeFuture { get; set; }


        public ActivitiesByDateRange(DateTime fromDateUtc, DateTime toDateUtc)
        {
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public ActivitiesByDateRange( DateTime fromDateUtc,
                                      DateTime toDateUtc,
                                      bool noUndated,
                                      bool includeFuture)
        {
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
            IncludeFuture = includeFuture;
        }
    }

    public class HandleActivitiesByDateRangeQuery : IHandleQueries<ActivitiesByDateRange, IQueryable<ActivityView>>
    {
        private readonly ActivityViewProjector _projector;
        IProcessQueries queryProcessor

        public HandleActivitiesByDateRangeQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public IQueryable<ActivityView> Handle(ActivitiesByDateRange query)
        {
            if (query == null) throw new ArgumentNullException("query");
            IQueryable<ActivityView> activityViews = new EnumerableQuery<ActivityView>();

            try
            {
                var possibleNullView = _projector.BeginReadView();
                if (possibleNullView != null)
                {
                    var view = possibleNullView.AsQueryable();

                    activityViews = view.Where(a =>
                                       (
                                           /* and, include activities that are undated... */
                                           (!query.NoUndated || (!a.StartsOn.HasValue && !a.EndsOn.HasValue &&
                                            (!a.OnGoing.HasValue || !a.OnGoing.Value))) &&

                                           /* and */
                                           (
                                               /* On-going only */
                                               (!a.StartsOn.HasValue && !a.EndsOn.HasValue &&
                                                (a.OnGoing.HasValue && a.OnGoing.Value)) ||

                                               /* End date only (with future flag) */
                                               (!a.StartsOn.HasValue &&
                                                (a.EndsOn.HasValue && (a.EndsOn.Value >= query.FromDate) &&
                                                    (query.IncludeFuture || (a.EndsOn < query.ToDate)) ) &&
                                                (!a.OnGoing.HasValue || !a.OnGoing.Value)) ||

                                               /* Start date and on-going */
                                               ((a.StartsOn.HasValue && (a.StartsOn.Value < query.ToDate)) &&
                                                !a.EndsOn.HasValue && (a.OnGoing.HasValue && a.OnGoing.Value)) ||

                                               /* Start date only */
                                               ((a.StartsOn.HasValue &&
                                                 ((a.StartsOn.Value >= query.FromDate) &&
                                                  (a.StartsOn.Value < query.ToDate))) && !a.EndsOn.HasValue &&
                                                (!a.OnGoing.HasValue || !a.OnGoing.Value)) ||

                                               /* Start date and end date (with future flag) */
                                               ((a.StartsOn.HasValue && (a.StartsOn.Value >= query.FromDate))) &&
                                               (a.EndsOn.HasValue && (query.IncludeFuture || (a.EndsOn < query.ToDate))) &&
                                               (!a.OnGoing.HasValue || !a.OnGoing.Value))
                                       )
                        );
                }
            }
            finally
            {
                _projector.EndReadView();
            }

            return activityViews.AsQueryable();
        }
    }
}
