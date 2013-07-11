using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class FilesByAgreementId : BaseEntitiesQuery<AgreementFile>, IDefineQuery<AgreementFile[]>
    {
        public FilesByAgreementId(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class HandleFilesByAgreementIdQuery : IHandleQueries<FilesByAgreementId, AgreementFile[]>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleFilesByAgreementIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementFile[] Handle(FilesByAgreementId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<AgreementFile>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByAgreementId(query.AgreementId)
                .VisibleTo(query.Principal, _queryProcessor)
                .OrderBy(query.OrderBy)
            ;

            return queryable.ToArray();
        }
    }
}
