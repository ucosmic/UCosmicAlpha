using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByCountryIdEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int CountryId { get; private set; }
        public int EstablishmentId { get; private set; }

        public ActivityCountByCountryIdEstablishmentId(int inCountryId, int inEstablishmentId)
        {
            CountryId = inCountryId;
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandleActivityCountByCountryIdEstablishmentIdQuery : IHandleQueries<ActivityCountByCountryIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountByCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByCountryIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();

            return _entities.Query<Activity>().Count( a => (a.ModeText == publicMode) &&
                                                           (a.EditSourceId == null) &&
                    a.Values.Any(v => (v.Locations.Any(vl => vl.PlaceId == query.CountryId))) &&
                    a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId));
        }
    }
}
