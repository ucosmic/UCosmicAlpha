using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class ParticipantByAgreementIdAndEstablishmentId : BaseEntityQuery<AgreementParticipant>, IDefineQuery<AgreementParticipant>
    {
        public ParticipantByAgreementIdAndEstablishmentId(IPrincipal principal, int agreementId, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class HandleParticipantByAgreementIdAndEstablishmentIdQuery : IHandleQueries<ParticipantByAgreementIdAndEstablishmentId, AgreementParticipant>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleParticipantByAgreementIdAndEstablishmentIdQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementParticipant Handle(ParticipantByAgreementIdAndEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<AgreementParticipant>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByAgreementId(query.AgreementId)
                .VisibleTo(query.Principal, _queryProcessor)
                .SingleOrDefault(x => x.EstablishmentId == query.EstablishmentId)
            ;

            return result;
        }
    }
}
