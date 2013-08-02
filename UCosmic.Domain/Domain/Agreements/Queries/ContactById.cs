using System;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class ContactById : BaseEntityQuery<AgreementContact>, IDefineQuery<AgreementContact>
    {
        public ContactById(IPrincipal principal, int agreementId, int contactId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            ContactId = contactId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int ContactId { get; private set; }
    }

    public class HandleContactByIdQuery : IHandleQueries<ContactById, AgreementContact>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleContactByIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementContact Handle(ContactById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entity = _entities.Query<AgreementContact>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByAgreementId(query.AgreementId)
                .VisibleTo(query.Principal, _queryProcessor)
                .ById(query.ContactId)
            ;

            return entity;
        }
    }
}
