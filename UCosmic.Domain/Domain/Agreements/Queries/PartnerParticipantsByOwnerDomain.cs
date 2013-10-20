using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;

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
        public IEnumerable<int> AgreementIds { get; set; }
    }

    public class HandlePartnerParticipantsByOwnerDomainQuery : IHandleQueries<PartnerParticipantsByOwnerDomain, AgreementParticipant[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandlePartnerParticipantsByOwnerDomainQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementParticipant[] Handle(PartnerParticipantsByOwnerDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreementIds = _entities.Query<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[] { x => x.Participants })
                .ByOwnerDomain(query.OwnerDomain)
                .VisibleTo(query.Principal, _queryProcessor)
                .Select(x => x.Id);

            if (query.AgreementIds != null && query.AgreementIds.Any())
                agreementIds = agreementIds.Where(x => query.AgreementIds.Contains(x));

            var partners = _entities.Query<AgreementParticipant>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => agreementIds.Contains(x.AgreementId) && !x.IsOwner)
                .OrderBy(query.OrderBy)
            ;

            return partners.ToArray();
        }
    }
}
