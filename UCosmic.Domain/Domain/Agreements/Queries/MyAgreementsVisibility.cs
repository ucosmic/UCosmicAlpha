using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementsVisibility : IDefineQuery<AgreementVisibility>
    {
        public MyAgreementsVisibility(IPrincipal principal, string domain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Domain = domain;
        }

        public MyAgreementsVisibility(IPrincipal principal, int establishmentId)
            : this(principal, null)
        {
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public string Domain { get; private set; }
        public int? EstablishmentId { get; private set; }
    }

    public class HandleMyAgreementsVisibilityQuery : IHandleQueries<MyAgreementsVisibility, AgreementVisibility>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyAgreementsVisibilityQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementVisibility Handle(MyAgreementsVisibility query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var visibility = AgreementVisibility.Public;

            if (!query.Principal.Identity.IsAuthenticated ||
                (!query.EstablishmentId.HasValue && string.IsNullOrWhiteSpace(query.Domain)))
                return visibility;

            var myOwnedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));
            var domainEstablishmentId = query.EstablishmentId.HasValue ? query.EstablishmentId.Value : default(int);
            if (!query.EstablishmentId.HasValue)
            {
                var establishmentByDomain = new EstablishmentByDomain(query.Domain);
                domainEstablishmentId = _entities.Query<Establishment>()
                    .Where(x => x.WebsiteUrl != null && x.WebsiteUrl.Equals(establishmentByDomain.WebsiteUrl, StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.RevisionId).SingleOrDefault();
            }

            if (domainEstablishmentId != default(int) && myOwnedTenantIds.Contains(domainEstablishmentId))
                visibility = AgreementVisibility.Protected;

            if (visibility == AgreementVisibility.Protected && query.Principal.IsInAnyRole(RoleName.AgreementManagers))
                visibility = AgreementVisibility.Private;

            return visibility;
        }
    }
}