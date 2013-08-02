using System;
using System.Linq;
using UCosmic.Domain.Activities;

/*
 * Returns the number of countries that contain activities for the given establishment (people in that establishment).
*/

namespace UCosmic.Domain.Places
{
    public class CountryCountWithActivitiesByEstablishmentId : BaseEntitiesQuery<Place>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }

        public CountryCountWithActivitiesByEstablishmentId(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }
    }

    public class HandleCountryCountWithActivitiesByEstablishmentIdQuery
        : IHandleQueries<CountryCountWithActivitiesByEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleCountryCountWithActivitiesByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(CountryCountWithActivitiesByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");
            int count = 0;

            string publicMode = ActivityMode.Public.AsSentenceFragment();

            var countries = _entities.Query<Place>().Where(p => p.IsCountry);
            foreach (var country in countries)
            {
                count = _entities.Query<Activity>()
                                 .Count(a =>
                                        a.Values.Any(v => (v.ModeText == publicMode) &&
                                                          a.Person.Affiliations.Any(
                                                              f => f.RevisionId == query.EstablishmentId) &&
                                                          v.Locations.Any(l => l.RevisionId == country.RevisionId)));

            }

            return count;
        }
    }
}