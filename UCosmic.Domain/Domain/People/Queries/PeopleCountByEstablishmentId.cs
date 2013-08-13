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
        private readonly ActivityViewProjector _projector;

        public HandlePeopleCountByEstablishmentIdQuery(ActivityViewProjector projector)
        {
            _projector = projector;
        }

        public int Handle(PeopleCountByEstablishmentId query)
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
                                            /* EstablishmentId must be found in list of affiliated establishments...*/
                                            a.EstablishmentIds.Any(e => e == query.EstablishmentId) &&

                                            /* and, include activities that are undated... */
                                            (!a.StartsOn.HasValue && !a.EndsOn.HasValue) ||
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
                                            )
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
