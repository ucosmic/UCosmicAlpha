using System;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class AgreementById : BaseEntityQuery<Agreement>, IDefineQuery<Agreement>
    {
        public AgreementById(IPrincipal principal, int id)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class HandleAgreementByIdQuery : IHandleQueries<AgreementById, Agreement>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleAgreementByIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public Agreement Handle(AgreementById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreement = _entities.Query<Agreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .ById(query.Id);
            if (agreement == null) return null;

            agreement = agreement.ApplySecurity(query.Principal, _queryProcessor);

            return agreement;
        }
    }
}
