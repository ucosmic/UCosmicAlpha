using System;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class MyAffiliationByEstablishmentId : IDefineQuery<Affiliation>
    {
        public MyAffiliationByEstablishmentId(IPrincipal principal, int establishmentId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
    }

    public class HandleMyAffiliationByEstablishmentIdQuery : IHandleQueries<MyAffiliationByEstablishmentId, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleMyAffiliationByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation Handle(MyAffiliationByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Affiliation>()
                .EagerLoad(_entities, new Expression<Func<Affiliation, object>>[]
                {
                    a => a.Person,
                    a => a.Establishment,
                })
                .ByUserNameAndEstablishmentId(query.Principal.Identity.Name, query.EstablishmentId);
        }
    }
}
