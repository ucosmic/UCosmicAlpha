using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleCountByTypeIdCountryIdEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int CountryId { get; private set; }
        public int EstablishmentId { get; private set; }

        public PeopleCountByTypeIdCountryIdEstablishmentId(int inTypeId, int inCountryId, int inEstablishmentId)
        {
            TypeId = inTypeId;
            CountryId = inCountryId;
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandlePeopleCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<PeopleCountByTypeIdCountryIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleCountByTypeIdCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleCountByTypeIdCountryIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            var activityGroups = _entities.Query<Activity>().Where(
                a => (a.ModeText == publicMode) &&
                     (a.EditSourceId == null) &&
                     a.Values.Any(v => (v.Locations.Any(vl => vl.PlaceId == query.CountryId)) &&
                                       (v.Types.Any(vt => vt.TypeId == query.TypeId))) &&
                     a.Person.Affiliations.Any(f => f.EstablishmentId == query.EstablishmentId))
                            .GroupBy(g => g.PersonId);

            return activityGroups.Count();
        }
    }
}
