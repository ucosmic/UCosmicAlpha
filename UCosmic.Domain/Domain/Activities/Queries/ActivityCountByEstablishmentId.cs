using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
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
        private readonly IQueryEntities _entities;

        public HandleActivityCountByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count(a => (a.ModeText == publicMode) &&
                                                          (a.EditSourceId == null) &&
                                                          a.Person.Affiliations.Any(
                                                              f => f.EstablishmentId == query.EstablishmentId) &&

                                                          a.Values.Any(v =>
                                                                       /* and, include activities that are undated... */
                                                                       (!v.StartsOn.HasValue && !v.EndsOn.HasValue) ||
                                                                       /* or */
                                                                       (
                                                                           /* there is no start date, or there is a start date and its >= the FromDate... */
                                                                           (!v.StartsOn.HasValue ||
                                                                            (v.StartsOn.Value >= query.FromDate)) &&

                                                                           /* and, OnGoing has value and true,
                                                                            * or there is no end date, or there is an end date and its earlier than ToDate. */
                                                                           ((v.OnGoing.HasValue && v.OnGoing.Value) ||
                                                                            (!v.EndsOn.HasValue ||
                                                                             (v.EndsOn.Value < query.ToDate)))
                                                                       )
                                                              )
                );
        }
    }
}
