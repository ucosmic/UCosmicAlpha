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
        private readonly ActivityViewProjector _projector;

        public HandlePeopleCountByTypeIdCountryIdEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(PeopleCountByTypeIdPlaceIdEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");
            int count = 0;

            try
            {
                var possibleNullView = _projector.BeginReadView();
                if (possibleNullView != null)
                {
                    var view = possibleNullView.AsQueryable();

                    var groups = view.Where(a =>
                                            /* TypeId must be found in typeIds */
                                            a.TypeIds.Any(t => t == query.TypeId) &&

                                            /* and, PlaceId must be found in list placeIds...*/
                                            a.PlaceIds.Any(e => e == query.PlaceId) &&

                                            /* and, EstablishmentId must be found in list of affiliated establishments...*/
                                            a.EstablishmentIds.Any(e => e == query.EstablishmentId) &&

                                            /* and, include activities that are undated... */
                                            ((!a.StartsOn.HasValue && !a.EndsOn.HasValue) ||
                                             /* or */
                                             (
                                                 /* there is no start date, or there is a start date and its >= the FromDate... */
                                                 (!a.StartsOn.HasValue ||
                                                  (a.StartsOn.Value >= query.FromDate)) &&

                                                 /* and, OnGoing has value and true,
                                                * or there is no end date, or there is an end date and its earlier than ToDate. */
                                                 ((a.OnGoing.HasValue && a.OnGoing.Value) ||
                                                  (!a.EndsOn.HasValue ||
                                                   (a.EndsOn.Value < query.ToDate)))
                                             ))
                        )
                                     .GroupBy(g => g.PersonId);

                    count = groups.Count();
                }
            }
            finally
            {
                _projector.EndReadView();
            }

            return count;
        }
    }
}
