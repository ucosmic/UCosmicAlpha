using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class MyAffiliations : BaseEntitiesQuery<Affiliation>, IDefineQuery<Affiliation[]>
    {
        public MyAffiliations(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public bool? IsDefault { get; set; }
    }

    public class HandleMyAffiliationsQuery : IHandleQueries<MyAffiliations, Affiliation[]>
    {
        private readonly IQueryEntities _entities;

        public HandleMyAffiliationsQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Affiliation[] Handle(MyAffiliations query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var entities = _entities.Query<Affiliation>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Person.User != null && x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase))
            ;

            if (query.IsDefault.HasValue)
                entities = entities.Where(x => x.IsDefault == query.IsDefault.Value);

            entities = entities.OrderBy(query.OrderBy);
            return entities.ToArray();
        }
    }
}
