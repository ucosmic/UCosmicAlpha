using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class AffiliationByUser : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        public AffiliationByUser(IPrincipal user, int establishmentId)
        {
            if (user == null) throw new ArgumentNullException("user");
            User = user;
            EstablishmentId = establishmentId;
        }

        public IPrincipal User { get; private set; }
        public int EstablishmentId { get; private set; }
    }

    public class HandleAffiliationByUserQuery : IHandleQueries<AffiliationByUser, Affiliation>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationByUserQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation Handle(AffiliationByUser query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Affiliation>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.Person.User != null
                    && x.Person.User.Name.Equals(query.User.Identity.Name, StringComparison.OrdinalIgnoreCase)
                    && x.EstablishmentId == query.EstablishmentId);
        }
    }
}
