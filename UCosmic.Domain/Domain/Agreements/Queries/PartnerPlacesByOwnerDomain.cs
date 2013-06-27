using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
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

        internal string WwwOwnerDomain
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_wwwOwnerDomain))
                {
                    _wwwOwnerDomain = OwnerDomain;
                    if (_wwwOwnerDomain != null && !_wwwOwnerDomain.Equals("default", StringComparison.OrdinalIgnoreCase)
                        && !_wwwOwnerDomain.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
                        _wwwOwnerDomain = string.Format("www.{0}", _wwwOwnerDomain);
                }
                return _wwwOwnerDomain;
            }
        }
        private string _wwwOwnerDomain;
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
        private readonly IHandleCommands<EnsureUserTenancy> _ensureTenancy;

        public HandlePartnerPlacesByOwnerDomainQuery(IQueryEntities entities
            , IHandleCommands<EnsureUserTenancy> ensureTenancy
        )
        {
            _entities = entities;
            _ensureTenancy = ensureTenancy;
        }

        public AgreementPartnerPlaceResult[] Handle(PartnerPlacesByOwnerDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // make sure user has a tenant id
            var ensuredTenancy = new EnsureUserTenancy(query.Principal.Identity.Name);
            _ensureTenancy.Handle(ensuredTenancy);

            // get security context of the user (some agreements may be private or protected)
            var ownedIds = new List<int>();
            var user = ensuredTenancy.EnsuredUser;
            if (user != null && user.TenantId.HasValue)
                ownedIds.Add(user.TenantId.Value);
            if (ownedIds.Any()) // include all establishments downstream from the tenant (its offspring)
                ownedIds.AddRange(_entities.Query<Establishment>()
                    .Where(x => x.Ancestors.Any(y => y.AncestorId == ownedIds.FirstOrDefault()))
                    .Select(x => x.RevisionId));

            // query all agreements for the domain
            var agreements = _entities.Query<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[] { x => x.Participants })
                .Where(x => x.Participants.Any(y => y.IsOwner
                    && (
                        (y.Establishment.WebsiteUrl != null && y.Establishment.WebsiteUrl.Equals(query.WwwOwnerDomain, StringComparison.OrdinalIgnoreCase))
                        ||
                        (y.Establishment.Ancestors.Any(z => z.Ancestor.WebsiteUrl != null && z.Ancestor.WebsiteUrl.Equals(query.WwwOwnerDomain)))
                    )
                )).ToList()
            ;

            // if user is not authorized to view the agreement, remove it
            foreach (var agreement in agreements.ToArray())
            {
                if (agreement.Visibility == AgreementVisibility.Public) continue;

                var hasProtectedAccess = agreement.Participants.Any(x => x.IsOwner && ownedIds.Contains(x.EstablishmentId));
                if (agreement.Visibility == AgreementVisibility.Protected && !hasProtectedAccess)
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));

                var hasPrivateAccess = hasProtectedAccess && query.Principal.IsInAnyRole(RoleName.AgreementManagers);
                if (agreement.Visibility == AgreementVisibility.Private && !hasPrivateAccess)
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));
            }

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

            return partnerPlaces;
        }
    }
}
