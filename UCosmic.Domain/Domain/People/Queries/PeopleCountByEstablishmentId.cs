using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleCountByEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int EstablishmentId { get; protected set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }


        public PeopleCountByEstablishmentId(int establishmentId,
                                            DateTime fromDateUtc,
                                            DateTime toDateUtc)
        {
            EstablishmentId = establishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }
    }

    public class HandlePeopleCountByEstablishmentIdQuery : IHandleQueries<PeopleCountByEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleCountByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            var activityGroups = _entities.Query<Activity>().Where(
                a => (a.ModeText == publicMode) &&
                     (a.EditSourceId == null) &&

                     a.Person.Affiliations.Any(x => x.IsDefault &&
                                                    (x.EstablishmentId == query.EstablishmentId ||
                                                     x.Establishment.Ancestors.Any(y => y.AncestorId ==
                                                                                        query.EstablishmentId))) &&

                     a.Values.Any(v =>
                                  /* and, include activities that are undated... */
                                  (!v.StartsOn.HasValue && !v.EndsOn.HasValue) ||
                                  /* or */
                                  (
                                      /* there is no start date, or there is a start date and its >= the FromDate... */
                                      (!v.StartsOn.HasValue || (v.StartsOn.Value >= query.FromDate)) &&

                                      /* and, OnGoing has value and true,
                                * or there is no end date, or there is an end date and its earlier than ToDate. */
                                      ((v.OnGoing.HasValue && v.OnGoing.Value) ||
                                       (!v.EndsOn.HasValue || (v.EndsOn.Value < query.ToDate)))
                                  )
                         )
                )
                                          .GroupBy(g => g.PersonId);

            return activityGroups.Count();
        }
    }
}
