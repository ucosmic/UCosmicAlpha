using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountryCountByEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }

        public ActivityCountryCountByEstablishmentId(int inEstablishmentId)
        {
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandleActivityCountryCountByEstablishmentIdQuery : IHandleQueries<ActivityCountryCountByEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountryCountByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountryCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count(
                a => a.Values.Any(v => (v.ModeText == publicMode)) &&
                     a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId));
        }
    }
}
