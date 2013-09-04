using System;
using System.Linq;
using UCosmic.Domain.Degrees;

namespace UCosmic.Domain.People
{
    public class PeopleWithDegreesCountByPlaceIdsEstablishmentId : BaseViewsQuery<Degree>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }
        public int[] PlacesIds { get; private set; }
        public DateTime FromDate { get; private set; }
        public DateTime ToDate { get; private set; }
        public bool NoUndated { get; private set; }


        public PeopleWithDegreesCountByPlaceIdsEstablishmentId( int[] inPlaceIds
                                                     ,int inEstablishmentId
                                                    ,DateTime fromDateUtc
                                                    ,DateTime toDateUtc
                                            )
        {
            PlacesIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
        }

        public PeopleWithDegreesCountByPlaceIdsEstablishmentId( int[] inPlaceIds
                                              , int inEstablishmentId
                                              , DateTime fromDateUtc
                                              , DateTime toDateUtc
                                              , bool noUndated
                                )
        {
            PlacesIds = inPlaceIds;
            EstablishmentId = inEstablishmentId;
            FromDate = fromDateUtc;
            ToDate = toDateUtc;
            NoUndated = noUndated;
        }
    }

    public class HandlePeopleWithDegreesCountByPlaceIdsEstablishmentIdQuery : IHandleQueries<PeopleWithDegreesCountByPlaceIdsEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandlePeopleWithDegreesCountByPlaceIdsEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(PeopleWithDegreesCountByPlaceIdsEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var groups = _entities.Query<Degree>()
                            .Where(d =>
                                        //(
                                        //    (!d.YearAwarded.HasValue && !query.NoUndated) ||
                                        //    (d.YearAwarded.HasValue &&
                                        //        (d.YearAwarded >= query.FromDate.Year) &&
                                        //        (d.YearAwarded < query.ToDate.Year))
                                        //) &&

                                        (d.Institution.Location.Places.Any(e => query.PlacesIds.Contains(e.RevisionId))) &&

                                        (
                                            ((d.Person.Affiliations.Count(x => x.IsDefault) == 1) &&
                                                (d.Person.Affiliations.FirstOrDefault(x => x.IsDefault).EstablishmentId == query.EstablishmentId)) ||
                                            (d.Person.Affiliations.Any(a => a.Establishment.RevisionId == query.EstablishmentId)) ||
                                            (d.Person.Affiliations.Any(a => a.CampusId.HasValue && (a.CampusId == query.EstablishmentId))) ||
                                            (d.Person.Affiliations.Any(a => a.CollegeId.HasValue && (a.CampusId == query.EstablishmentId))) ||
                                            (d.Person.Affiliations.Any(a => a.Establishment.Ancestors.Any(n => n.AncestorId == query.EstablishmentId)))
                                        )
                            )
                           .GroupBy(g => g.PersonId);

            return groups.Count();
        }
    }
}
