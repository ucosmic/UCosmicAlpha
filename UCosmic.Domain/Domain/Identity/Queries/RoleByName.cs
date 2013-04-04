using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class RoleByName : BaseEntityQuery<Role>, IDefineQuery<Role>
    {
        public RoleByName(IPrincipal principal, string name)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be null, empty, or whitespace.", "name");
            Principal = principal;
            Name = name;
        }

        public IPrincipal Principal { get; private set; }
        public string Name { get; private set; }
    }

    public class HandleRoleByNameQuery : IHandleQueries<RoleByName, Role>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleRoleByNameQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public Role Handle(RoleByName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new RolesUnfiltered(query.Principal)
            {
                EagerLoad = query.EagerLoad,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            return internalQueryable
                .SingleOrDefault(x => query.Name.Equals(x.Name, StringComparison.OrdinalIgnoreCase))
            ;
        }
    }
}
