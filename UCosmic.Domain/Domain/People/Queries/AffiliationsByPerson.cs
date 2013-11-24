using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class AffiliationsByPerson : BaseEntitiesQuery<Affiliation>, IDefineQuery<IQueryable<Affiliation>>
    {
        public AffiliationsByPerson(IPrincipal principal, int? personId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int? PersonId { get; set; }
    }

    public class HandleAffiliationsByPersonQuery : IHandleQueries<AffiliationsByPerson, IQueryable<Affiliation>>
    {
        private readonly IQueryEntities _entities;

        public HandleAffiliationsByPersonQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<Affiliation> Handle(AffiliationsByPerson query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entities = _entities.Query<Affiliation>()
                .EagerLoad(_entities, query.EagerLoad)
            ;

            if (query.PersonId.HasValue)
            {
                entities = entities.Where(x => x.PersonId == query.PersonId.Value);
            }
            else
            {
                entities = entities.Where(x => x.Person.User != null &&
                    x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase));
            }

            entities = entities.OrderBy(query.OrderBy);

            return entities;
        }
    }
}
