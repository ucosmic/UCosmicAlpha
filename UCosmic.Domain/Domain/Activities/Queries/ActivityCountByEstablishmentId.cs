using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }

        public ActivityCountByEstablishmentId(int inEstablishmentId)
        {
            EstablishmentId = inEstablishmentId;
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
            return _entities.Query<Activity>().Count( a => (a.ModeText == publicMode) &&
                                                           (a.EditSourceId == null) &&
                     a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId));
        }
    }
}
