using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class RoleById : BaseEntityQuery<Role>, IDefineQuery<Role>
    {
        public RoleById(IPrincipal principal, int id)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class HandleRoleByIdQuery : IHandleQueries<RoleById, Role>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleRoleByIdQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public Role Handle(RoleById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new RolesUnfiltered(query.Principal)
            {
                EagerLoad = query.EagerLoad,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            return internalQueryable
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;
        }
    }
}
