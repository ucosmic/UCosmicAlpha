using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class PartnerParticipantsByOwnerDomain : BaseEntitiesQuery<AgreementParticipant>, IDefineQuery<AgreementParticipant[]>
    {
        public PartnerParticipantsByOwnerDomain(IPrincipal principal, string ownerDomain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            OwnerDomain = ownerDomain;
        }

        public IPrincipal Principal { get; private set; }
        public string OwnerDomain { get; private set; }

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

    public class HandlePartnerParticipantsByOwnerDomainQuery : IHandleQueries<PartnerParticipantsByOwnerDomain, AgreementParticipant[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IHandleCommands<EnsureUserTenancy> _ensureTenancy;

        public HandlePartnerParticipantsByOwnerDomainQuery(IQueryEntities entities
            , IHandleCommands<EnsureUserTenancy> ensureTenancy
        )
        {
            _entities = entities;
            _ensureTenancy = ensureTenancy;
        }

        public AgreementParticipant[] Handle(PartnerParticipantsByOwnerDomain query)
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
                ))
                .Select(x => new { VisibilityText = x.VisibilityText, Id = x.Id, Participants = x.Participants })
                .ToList()
            ;

            // if user is not authorized to view the agreement, remove it
            foreach (var agreement in agreements.ToArray())
            {
                if ("Public".Equals(agreement.VisibilityText, StringComparison.OrdinalIgnoreCase)) continue;

                var hasProtectedAccess = agreement.Participants.Any(x => x.IsOwner && ownedIds.Contains(x.EstablishmentId));
                if ("Protected".Equals(agreement.VisibilityText, StringComparison.OrdinalIgnoreCase) && !hasProtectedAccess)
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));

                var hasPrivateAccess = hasProtectedAccess && query.Principal.IsInAnyRole(RoleName.AgreementManagers);
                if ("Private".Equals(agreement.VisibilityText, StringComparison.OrdinalIgnoreCase) && !hasPrivateAccess)
                    agreements.Remove(agreements.Single(x => x.Id == agreement.Id));
            }

            var allAgreementIds = agreements.Select(x => x.Id);

            var partners = _entities.Query<AgreementParticipant>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => allAgreementIds.Contains(x.AgreementId) && !x.IsOwner)
                .OrderBy(query.OrderBy)
            ;

            return partners.ToArray();
        }
    }
}
