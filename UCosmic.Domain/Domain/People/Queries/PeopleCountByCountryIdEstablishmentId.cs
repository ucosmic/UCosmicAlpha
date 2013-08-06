using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleCountByCountryIdEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int CountryId { get; private set; }
        public int EstablishmentId { get; private set; }

        public PeopleCountByCountryIdEstablishmentId(int inCountryId, int inEstablishmentId)
        {
            CountryId = inCountryId;
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandlePeopleCountByCountryIdEstablishmentIdQuery : IHandleQueries<PeopleCountByCountryIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleCountByCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleCountByCountryIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();

            var activityGroups = _entities.Query<Activity>().Where(a => (a.ModeText == publicMode) &&
                                                                    (a.EditSourceId == null) &&
                                                                    a.Values.Any(
                                                                        v =>
                                                                        (v.Locations.Any(
                                                                            vl => vl.PlaceId == query.CountryId))) &&
                                                                    a.Person.Affiliations.Any(
                                                                        f => f.EstablishmentId == query.EstablishmentId))
                                      .GroupBy(g => g.PersonId);

            return activityGroups.Count();
        }
    }
}
