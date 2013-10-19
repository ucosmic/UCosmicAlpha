using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Agreements
{
    public class PartnerPlacesByOwnerDomain : BaseEntitiesQuery<Place>, IDefineQuery<AgreementPartnerPlaceResult[]>
    {
        public PartnerPlacesByOwnerDomain(IPrincipal principal, string ownerDomain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            OwnerDomain = ownerDomain;
        }

        public IPrincipal Principal { get; private set; }
        public string OwnerDomain { get; private set; }
        public PlaceGroup? GroupBy { get; set; }
    }

    public class AgreementPartnerPlaceResult
    {
        public AgreementPartnerPlaceResult()
        {
            AgreementIds = new int[0];
        }

        public int[] AgreementIds { get; internal set; }
        public int AgreementCount
        {
            get { return AgreementIds == null ? 0 : AgreementIds.Count(); }
        }
        public Place Place { get; internal set; }
    }

    public class HandlePartnerPlacesByOwnerDomainQuery : IHandleQueries<PartnerPlacesByOwnerDomain, AgreementPartnerPlaceResult[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandlePartnerPlacesByOwnerDomainQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementPartnerPlaceResult[] Handle(PartnerPlacesByOwnerDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreements = _entities.Query<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[] { x => x.Participants })
                .ByOwnerDomain(query.OwnerDomain)
                .VisibleTo(query.Principal, _queryProcessor)
            ;

            // set up data for grouping and counting
            var agreementIdPartnerIds = agreements.ToDictionary(x => x.Id,
                x => x.Participants.Where(y => !y.IsOwner).Select(y => y.EstablishmentId).ToArray());
            var uniqiePartnerIds = agreementIdPartnerIds.SelectMany(x => x.Value).Distinct();

            var candidateLocations = _entities.Query<EstablishmentLocation>()
                .Where(x => uniqiePartnerIds.Contains(x.RevisionId));
            var candidatePlaces = candidateLocations
                .SelectMany(x => x.Places).Distinct();
            var partnerIdPlaceIds = candidateLocations
                .Select(x => new { Key = x.RevisionId, Value = x.Places.Select(y => y.RevisionId) })
                .ToArray().ToDictionary(x => x.Key, x => x.Value);

            if (query.GroupBy == PlaceGroup.Continents) // filter out all non-continent places
                candidatePlaces = candidatePlaces.Where(x => x.IsContinent);

            else if (query.GroupBy == PlaceGroup.Countries) // filter out all non-country places
                candidatePlaces = candidatePlaces.Where(x => x.IsCountry);

            // when there is no group by, use only the most specific (last) place in the partner location
            else
            {
                var lastPlaceIds = partnerIdPlaceIds.Select(x => x.Value.Last());
                candidatePlaces = candidatePlaces.Where(x => lastPlaceIds.Contains(x.RevisionId));
            }

            // execute query to eager load and stash entities in results
            var candidatePlaceIds = candidatePlaces.Select(x => x.RevisionId);
            var partnerPlaceEntities = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => candidatePlaceIds.Contains(x.RevisionId))
                .OrderBy(query.OrderBy)
            ;
            var partnerPlaces = partnerPlaceEntities.ToArray()
                .Select(x => new AgreementPartnerPlaceResult { Place = x })
                .ToArray();

            // count number of agreements in each place
            foreach (var partnerPlace in partnerPlaces)
            {
                var partnerIds = partnerIdPlaceIds
                    .Where(x => x.Value.Any(y => y == partnerPlace.Place.RevisionId))
                    .Select(x => x.Key).Distinct().ToArray();
                var agreementIds = agreementIdPartnerIds
                    .Where(x => x.Value.Any(partnerIds.Contains))
                    .Select(x => x.Key).Distinct().ToArray();
                partnerPlace.AgreementIds = agreementIds;

                // fix (pare down) agreement counts for non-grouped places
                if (!query.GroupBy.HasValue)
                {
                    var newAgreementIds = new List<int>();
                    foreach (var agreementId in partnerPlace.AgreementIds.ToArray())
                    {
                        // is this place really the last in an agreement partner's place collection?
                        foreach (var partnerId in agreementIdPartnerIds.Single(x => x.Key == agreementId).Value)
                        {
                            var placeId = partnerIdPlaceIds.Single(x => x.Key == partnerId).Value.Last();
                            if (placeId == partnerPlace.Place.RevisionId)
                                newAgreementIds.Add(agreementId);
                        }
                    }
                    partnerPlace.AgreementIds = newAgreementIds.Distinct().ToArray();
                }
            }

            // add an unknown place for agreements that do not have place information
            if (query.GroupBy.HasValue)
            {
                var unknownAgreements = query.GroupBy.Value == PlaceGroup.Continents
                    ? agreements.Where(x => !x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsContinent)))
                    : agreements.Where(x => !x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry)));
                unknownAgreements = unknownAgreements.Distinct();
                if (unknownAgreements.Any())
                {
                    var unknownPlace = new AgreementPartnerPlaceResult
                    {
                        AgreementIds = unknownAgreements.Select(x => x.Id).ToArray(),
                        Place = new Place
                        {
                            OfficialName = string.Format("[{0} Unknown]", query.GroupBy.Value == PlaceGroup.Continents ? "Continent" : "Country"),
                            //OfficialName = "[Continent unknown]",
                            Center = new Coordinates(0, -180),
                            BoundingBox = new BoundingBox(5, -175, -5, 175),
                        },
                    };
                    partnerPlaces = partnerPlaces.Concat(new[] { unknownPlace }).ToArray();
                }
            }

            // add continents that have zero agreements
            if (query.GroupBy.HasValue && query.GroupBy.Value == PlaceGroup.Continents)
            {
                var parnerPlaceIds = partnerPlaces.Select(x => x.Place.RevisionId);
                var zeroContinents = _entities.Query<Place>()
                    .EagerLoad(_entities, query.EagerLoad)
                    .Where(x => x.IsContinent && !parnerPlaceIds.Contains(x.RevisionId))
                    .AsEnumerable()
                    .Select(x => new AgreementPartnerPlaceResult
                    {
                        AgreementIds = new int[0],
                        Place = x,
                    });
                partnerPlaces = partnerPlaces.Concat(zeroContinents).ToArray();
            }

            return partnerPlaces;
        }
    }
}
