using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using AutoMapper;
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

        public IEnumerable<int> AgreementIds { get; internal set; }
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

            var agreements = _entities.Query<Agreement>() // query all agreements for the domain
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[] { x => x.Participants })
                .Where(x => x.Participants.Any(y => y.IsOwner
                    && (
                        (y.Establishment.WebsiteUrl != null && y.Establishment.WebsiteUrl.Equals(query.WwwOwnerDomain, StringComparison.OrdinalIgnoreCase))
                        ||
                        (y.Establishment.Ancestors.Any(z => z.Ancestor.WebsiteUrl != null && z.Ancestor.WebsiteUrl.Equals(query.WwwOwnerDomain)))
                    )
                )).ToList()
            ;

            //var agreementPlaceMap = new Dictionary<int, IEnumerable<int>>();
            foreach (var agreement in agreements.ToArray())
            {
                // if user is not authorized to view the agreement, remove it
                if (agreement.Visibility == AgreementVisibility.Protected && !agreement.Participants.Any(x => x.IsOwner && ownedIds.Contains(x.EstablishmentId)))
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));
                if (agreement.Visibility == AgreementVisibility.Private && (!agreement.Participants.Any(x => x.IsOwner && ownedIds.Contains(x.EstablishmentId)) || !query.Principal.IsInAnyRole(RoleName.AgreementManagers)))
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));

                //if (agreements.Any(x => x.Id == agreement.Id))
                //    agreementPlaceMap.Add(agreement.Id, agreement.Participants.Where(x => !x.IsOwner).SelectMany(x => x.Establishment.Location.Places.Select(y => y.RevisionId)));
            }

            var partnerIds = agreements.SelectMany(x => x.Participants).Where(x => !x.IsOwner).Select(x => x.EstablishmentId).Distinct();
            //var placeSets1 = _entities.Query<EstablishmentLocation>().Where(x => partnerIds.Contains(x.RevisionId)).Select(x => x.Places);
            var placeSets = _entities.Query<EstablishmentLocation>().Where(x => partnerIds.Contains(x.RevisionId))
                .ToDictionary(x => x.RevisionId, x => x.Places);
            var places = placeSets.SelectMany(x => x.Value).Distinct();

            if (query.GroupBy == PlaceGroup.Continents) // filter out all non-continent places
                places = places.Where(x => x.IsContinent);
            if (query.GroupBy == PlaceGroup.Countries) // filter out all non-country places
                places = places.Where(x => x.IsCountry);
            if (!query.GroupBy.HasValue)
            {
                var pointPlaces = new List<Place>();
                foreach (var placeSet in placeSets)
                    if (placeSet.Value.Any()) pointPlaces.Add(placeSet.Value.Last());
                places = pointPlaces.Distinct().AsQueryable();
            }

            var placeIds = places.Select(x => x.RevisionId);

            var partnerPlaceEntities = _entities.Query<Place>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => placeIds.Contains(x.RevisionId))
                .OrderBy(query.OrderBy)
            ;

            var partnerPlaces = partnerPlaceEntities.ToArray().Select(x => new AgreementPartnerPlaceResult { Place = x });

            foreach (var partnerPlace in partnerPlaces)
            {
                foreach (var agreement in agreements)
                {
                    var agreementPartnerIds = agreement.Participants.Where(x => !x.IsOwner).Select(x => x.EstablishmentId);
                    var agreementPlaceIds = placeSets.Where(x => agreementPartnerIds.Contains(x.Key)).SelectMany(x => x.Value).Select(x => x.RevisionId);
                    if (!query.GroupBy.HasValue)
                    {
                        if (agreementPlaceIds.Last() == partnerPlace.Place.RevisionId)
                        {
                            partnerPlace.AgreementIds = new List<int>(partnerPlace.AgreementIds) { agreement.Id }.ToArray();
                        }
                    }
                    else
                    {
                        if (agreementPlaceIds.Contains(partnerPlace.Place.RevisionId))
                        {
                            partnerPlace.AgreementIds = new List<int>(partnerPlace.AgreementIds) { agreement.Id }.ToArray();
                        }
                    }
                }
            }

            //var totalAgreementCount = partnerPlaces.Sum(x => x.AgreementCount);

            return partnerPlaces.ToArray();
        }
    }
}
