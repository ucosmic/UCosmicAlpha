using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountByCountry : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int CountryId { get; private set; }

        public ActivityCountByCountry(int inCountryId)
        {
            CountryId = inCountryId;
        }
    }

    public class HandleActivityCountByCountryQuery : IHandleQueries<ActivityCountByCountry, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountByCountryQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountByCountry query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            return _entities.Query<Activity>().Count(
                a => a.Values.Any(v => (v.ModeText == publicMode) &&
                        v.Locations.Any(l => l.Place.RevisionId == query.CountryId)));
        }
    }
}
