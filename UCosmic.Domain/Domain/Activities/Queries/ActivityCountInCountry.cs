using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class ActivityCountInCountry : BaseEntityQuery<Activity>, IDefineQuery<int>
    {
        public int CountryId { get; private set; }

        public ActivityCountInCountry(int inCountryId)
        {
            CountryId = inCountryId;
        }
    }

    public class HandleActivityCountInCountryQuery : IHandleQueries<ActivityCountInCountry, int>
    {
        private readonly IQueryEntities _entities;

        public HandleActivityCountInCountryQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(ActivityCountInCountry query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Activity>().Count(
                a =>
                a.Values.Any(v =>
                             v.Locations.Any(l =>
                                             l.Place.Ancestors.Any(
                                                 c => c.Ancestor.RevisionId == query.CountryId))));

        }
    }
}
