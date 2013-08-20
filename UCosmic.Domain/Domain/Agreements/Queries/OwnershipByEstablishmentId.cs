using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class OwnershipByEstablishmentId : IDefineQuery<bool>
    {
        public OwnershipByEstablishmentId(IPrincipal principal, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
    }

    public class HandleOwnershipByEstablishmentIdQuery : IHandleQueries<OwnershipByEstablishmentId, bool>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleOwnershipByEstablishmentIdQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public bool Handle(OwnershipByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));
            return ownedTenantIds.Contains(query.EstablishmentId);
        }
    }
}
