using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByTypeIdCountryIdEstablishmentId : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int CountryId { get; private set; }
        public int EstablishmentId { get; private set; }

        public ActivityCountByTypeIdCountryIdEstablishmentId(int inTypeId, int inCountryId, int inEstablishmentId)
        {
            TypeId = inTypeId;
            CountryId = inCountryId;
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<ActivityCountByTypeIdCountryIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountByTypeIdCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByTypeIdCountryIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count(
                a =>
                a.Values.Any(v => (v.ModeText == publicMode) &&
                                  (v.Locations.Any(vl => vl.RevisionId == query.CountryId)) &&
                                  (v.Types.Any(vt => vt.TypeId == query.TypeId))) &&
                a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId));
        }
    }
}
