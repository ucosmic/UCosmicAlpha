using System;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class FileById : BaseEntityQuery<AgreementFile>, IDefineQuery<AgreementFile>
    {
        public FileById(IPrincipal principal, int agreementId, int fileId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            FileId = fileId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int FileId { get; private set; }
    }

    public class HandleFileByIdQuery : IHandleQueries<FileById, AgreementFile>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleFileByIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementFile Handle(FileById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entity = _entities.Query<AgreementFile>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByAgreementId(query.AgreementId)
                .VisibleTo(query.Principal, _queryProcessor)
                .ById(query.FileId)
            ;

            return entity;
        }
    }
}
