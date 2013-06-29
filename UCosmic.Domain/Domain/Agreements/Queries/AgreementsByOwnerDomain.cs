using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class AgreementsByOwnerDomain : BaseEntitiesQuery<Agreement>, IDefineQuery<Agreement[]>
    {
        public AgreementsByOwnerDomain(IPrincipal principal, string ownerDomain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            OwnerDomain = ownerDomain;
        }

        public IPrincipal Principal { get; private set; }
        public string OwnerDomain { get; private set; }
    }

    public class HandleAgreementsByOwnerDomainQuery : IHandleQueries<AgreementsByOwnerDomain, Agreement[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleAgreementsByOwnerDomainQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public Agreement[] Handle(AgreementsByOwnerDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreements = _entities.Query<Agreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByOwnerDomain(query.OwnerDomain)
                .VisibleTo(query.Principal, _queryProcessor)
                .OrderBy(query.OrderBy)
            ;

            agreements.ApplySecurity(query.Principal, _queryProcessor);
            return agreements.ToArray();
        }
    }
}
