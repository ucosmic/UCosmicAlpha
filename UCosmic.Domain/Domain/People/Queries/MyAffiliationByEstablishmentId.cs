using System;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class MyAffiliationByEstablishmentId : IDefineQuery<Affiliation>
    {
        public IPrincipal Principal { get; set; }
        public int EstablishmentId { get; set; }
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
