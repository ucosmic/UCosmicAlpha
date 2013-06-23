using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class MyDefaultAffiliation : BaseEntityQuery<Establishment>, IDefineQuery<Establishment>
    {
        public MyDefaultAffiliation(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
    }

    public class HandleMyDefaultAffiliationQuery : IHandleQueries<MyDefaultAffiliation, Establishment>
    {
        private readonly IQueryEntities _entities;

        public HandleMyDefaultAffiliationQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment Handle(MyDefaultAffiliation query)
        {
            if (query == null) throw new ArgumentNullException("query");

            if (!string.IsNullOrWhiteSpace(query.Principal.Identity.Name))
            {
                var person = _entities.Query<Person>()
                    .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                    {
                        x => x.DefaultAffiliation,
                    })
                    .SingleOrDefault(x => x.User != null
                        && query.Principal.Identity.Name.Equals(x.User.Name, StringComparison.OrdinalIgnoreCase));
                if (person != null && person.DefaultAffiliation != null)
                {
                    return _entities.Query<Establishment>()
                        .EagerLoad(_entities, query.EagerLoad)
                        .SingleOrDefault(x => x.RevisionId == person.DefaultAffiliation.EstablishmentId);
                }

            }

            return null;
        }
    }
}
