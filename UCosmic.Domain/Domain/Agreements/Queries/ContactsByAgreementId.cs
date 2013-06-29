using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class ContactsByAgreementId : BaseEntitiesQuery<AgreementContact>, IDefineQuery<AgreementContact[]>
    {
        public ContactsByAgreementId(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class HandleContactsByAgreementIdQuery : IHandleQueries<ContactsByAgreementId, AgreementContact[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleContactsByAgreementIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementContact[] Handle(ContactsByAgreementId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));

            var queryable = _entities.Query<AgreementContact>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.AgreementId == query.AgreementId
                    && x.Agreement.Participants.Any(y => y.IsOwner && ownedTenantIds.Contains(y.EstablishmentId))
                )
                .OrderBy(query.OrderBy)
            ;

            return queryable.ToArray();
        }
    }
}
