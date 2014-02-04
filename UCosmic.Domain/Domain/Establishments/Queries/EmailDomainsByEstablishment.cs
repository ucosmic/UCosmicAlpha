using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EmailDomainsByEstablishment : BaseEntitiesQuery<EstablishmentEmailDomain>, IDefineQuery<IQueryable<EstablishmentEmailDomain>>
    {
        public EmailDomainsByEstablishment(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public int EstablishmentId { get; private set; }
    }

    public class HandleEmailDomainsByEstablishmentQuery : IHandleQueries<EmailDomainsByEstablishment, IQueryable<EstablishmentEmailDomain>>
    {
        private readonly IQueryEntities _entities;

        public HandleEmailDomainsByEstablishmentQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<EstablishmentEmailDomain> Handle(EmailDomainsByEstablishment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EstablishmentEmailDomain>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.EstablishmentId == query.EstablishmentId)
            ;
        }
    }
}
