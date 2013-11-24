//using System;
//using System.Linq;

//namespace UCosmic.Domain.Activities
//{
//    public class ActivityCountByEstablishmentId : BaseViewsQuery<ActivityView>, IDefineQuery<int>
//    {
//        public int EstablishmentId { get; private set; }
//        public DateTime? FromDate { get; private set; }
//        public DateTime? ToDate { get; private set; }
//        public bool NoUndated { get; private set; }
//        public bool IncludeFuture { get; private set; }

//        public ActivityCountByEstablishmentId(int inEstablishmentId,
//                                              DateTime? fromDateUtc = null,
//                                              DateTime? toDateUtc = null)
//        {
//            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
//            {
//                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
//            }

//            EstablishmentId = inEstablishmentId;
//            FromDate = fromDateUtc;
//            ToDate = toDateUtc;
//        }

//        public ActivityCountByEstablishmentId(int inEstablishmentId,
//                                              DateTime fromDateUtc,
//                                              DateTime toDateUtc,
//                                              bool noUndated,
//                                              bool includeFuture)
//        {
//            EstablishmentId = inEstablishmentId;
//            FromDate = fromDateUtc;
//            ToDate = toDateUtc;
//            NoUndated = noUndated;
//            IncludeFuture = includeFuture;
//        }
//    }

//    public class HandleActivityCountByEstablishmentIdQuery : IHandleQueries<ActivityCountByEstablishmentId, int>
//    {
//        private readonly ActivityViewProjector _projector;

//        public HandleActivityCountByEstablishmentIdQuery(ActivityViewProjector projector)
//        {
//            _projector = projector;
//        }

//        public int Handle(ActivityCountByEstablishmentId query)
//        {
//            if (query == null) throw new ArgumentNullException("query");
//            int count = 0;

//            try
//            {
//                var possibleNullView = _projector.BeginReadView();
//                if (possibleNullView != null)
//                {
//                    var view = possibleNullView.AsQueryable();

//                    if (query.FromDate.HasValue && query.ToDate.HasValue)
//                    {
//                        view = view.ApplyDateRange(query.FromDate.Value,
//                                                   query.ToDate.Value,
//                                                   query.NoUndated,
//                                                   query.IncludeFuture);
//                    }

//                    count = view.Count(a =>  a.EstablishmentIds.Contains(query.EstablishmentId) );
//                }

//            }
//            finally
//            {
//                _projector.EndReadView();
//            }

//            return count;
//        }
//    }
//}
