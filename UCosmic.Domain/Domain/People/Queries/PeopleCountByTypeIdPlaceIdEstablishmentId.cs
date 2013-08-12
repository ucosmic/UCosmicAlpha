using System;
using System.Linq;
using UCosmic.Domain.Activities;

namespace UCosmic.Domain.People
{
    public class PeopleCountByTypeIdPlaceIdEstablishmentId : BaseEntityQuery<Person>, IDefineQuery<int>
    {
        public int TypeId { get; private set; }
        public int PlaceId { get; private set; }
        public int EstablishmentId { get; private set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }

        public PeopleCountByTypeIdPlaceIdEstablishmentId(int inTypeId,
                                                         int inPlaceId,
                                                         int inEstablishmentId,
                                                         DateTime fromDateUtc,
                                                         DateTime toDateUtc)
        {
            TypeId = inTypeId;
            PlaceId = inPlaceId;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }
    }

    public class HandlePeopleCountByTypeIdCountryIdEstablishmentIdQuery : IHandleQueries<PeopleCountByTypeIdPlaceIdEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleCountByTypeIdCountryIdEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleCountByTypeIdPlaceIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            string publicMode = ActivityMode.Public.AsSentenceFragment();
            var activityGroups = _entities.Query<Activity>().Where(
                a => (a.ModeText == publicMode) &&
                     (a.EditSourceId == null) &&
                     a.Values.Any(v => (v.Locations.Any(vl => vl.PlaceId == query.PlaceId)) &&
                                       (v.Types.Any(vt => vt.TypeId == query.TypeId))) &&

                a.Person.Affiliations.Any(x => x.IsDefault &&
                    (x.EstablishmentId == query.EstablishmentId ||
                        x.Establishment.Ancestors.Any(y => y.AncestorId == query.EstablishmentId))) &&

                    a.Values.Any(v =>
                        /* and, include activities that are undated... */
                        (!v.StartsOn.HasValue && !v.EndsOn.HasValue) ||
 
                        (
                            /* or, there is no start date, or there is a start date and its >= the FromDate... */
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
