using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementVisibility : IDefineQuery<AgreementVisibility>
    {
        public MyAgreementVisibility(IPrincipal principal, string domain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Domain = domain;
        }

        public IPrincipal Principal { get; private set; }
        public string Domain { get; private set; }

        internal string WebsiteUrl
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Domain)) return Domain;
                if (!Domain.StartsWith("www."))
                    return string.Format("www.{0}", Domain);
                return Domain;
            }
        }
    }

    public class HandleMyAgreementVisibilityQuery : IHandleQueries<MyAgreementVisibility, AgreementVisibility>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyAgreementVisibilityQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementVisibility Handle(MyAgreementVisibility query)
        {
            if (query == null) throw new ArgumentNullException("query");

            if (!query.Principal.Identity.IsAuthenticated) return AgreementVisibility.Public;

            var myOwnedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));

            // when i own the tenant id of the website url, i have protected access
            var websiteUrls = _entities.Query<Establishment>()
                .Where(x => myOwnedTenantIds.Contains(x.RevisionId) && x.WebsiteUrl != null)
                .Select(x => x.WebsiteUrl);
            if (websiteUrls.Contains(query.WebsiteUrl))
                return query.Principal.IsInAnyRole(RoleName.AgreementManagers)
                    ? AgreementVisibility.Private
                    : AgreementVisibility.Protected;

            return AgreementVisibility.Public;
        }
    }
}