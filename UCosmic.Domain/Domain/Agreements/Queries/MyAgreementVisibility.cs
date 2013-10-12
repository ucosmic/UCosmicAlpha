using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementVisibility : IDefineQuery<AgreementVisibility>
    {
        public MyAgreementVisibility(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
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

            var visibility = AgreementVisibility.Public;

            if (!query.Principal.Identity.IsAuthenticated)
                return visibility;

            // when i own the agreement owner, i have protected access
            var myOwnedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));
            var agreementOwnerIds = _entities.Query<Agreement>()
                .Where(x => x.Id == query.AgreementId)
                .SelectMany(x => x.Participants.Where(y => y.IsOwner).Select(y => y.EstablishmentId));
            if (agreementOwnerIds.All(x => myOwnedTenantIds.Contains(x)))
                visibility = AgreementVisibility.Protected;

            if (visibility == AgreementVisibility.Protected && query.Principal.IsInAnyRole(RoleName.AgreementManagers))
                visibility = AgreementVisibility.Private;

            return visibility;
        }
    }
}