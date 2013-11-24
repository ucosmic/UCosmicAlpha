//using System;
//using System.Linq;
//using UCosmic.Domain.Activities;

//namespace UCosmic.Domain.People
//{
//    public class PeopleWithActivitiesCountByEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
//    {
//        public int EstablishmentId { get; protected set; }
//        public DateTime? FromDate { get; private set; }
//        public DateTime? ToDate { get; private set; }
//        public bool NoUndated { get; private set; }
//        public bool IncludeFuture { get; private set; }

//        public PeopleWithActivitiesCountByEstablishmentId(int establishmentId,
//                                                          DateTime? fromDateUtc = null,
//                                                          DateTime? toDateUtc = null)
//        {
//            if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
//            {
//                throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
//            }

//            EstablishmentId = establishmentId;
//            FromDate = fromDateUtc;
//            ToDate = toDateUtc;
//        }

//        public PeopleWithActivitiesCountByEstablishmentId(int establishmentId,
//                                            DateTime fromDateUtc,
//                                            DateTime toDateUtc,
//                                            bool noUndated,
//                                            bool includeFuture)
//        {
//            EstablishmentId = establishmentId;
//            FromDate = fromDateUtc;
//            ToDate = toDateUtc;
//            NoUndated = noUndated;
//            IncludeFuture = includeFuture;
//        }
//    }

//    public class HandlePeopleWithActivitiesCountByEstablishmentIdQuery : IHandleQueries<PeopleWithActivitiesCountByEstablishmentId, int>
//    {
//        private readonly ActivityViewProjector _projector;

//        public HandlePeopleWithActivitiesCountByEstablishmentIdQuery(ActivityViewProjector projector)
//        {
//            _projector = projector;
//        }

//        public int Handle(PeopleWithActivitiesCountByEstablishmentId query)
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

//                    var groups = view.Where(a => a.EstablishmentIds.Contains(query.EstablishmentId))
//                                     .GroupBy(g => g.PersonId);

//                    count = groups.Count();
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
