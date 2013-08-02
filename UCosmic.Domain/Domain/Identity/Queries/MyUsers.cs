using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class MyUsers : BaseEntitiesQuery<User>, IDefineQuery<IQueryable<User>>
    {
        internal MyUsers(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
    }

    public class HandleMyUsersQuery : IHandleQueries<MyUsers, IQueryable<User>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyUsersQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public IQueryable<User> Handle(MyUsers query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<User>()
                .EagerLoad(_entities, query.EagerLoad);

            // only return users controlled by the requesting principal
            if (!query.Principal.IsInRole(RoleName.AuthenticationAgent) && // only agents are tenant agnostic
                !query.Principal.IsInRole(RoleName.AuthorizationAgent)) // filter to the non-agent's tenant
            {
                // get a list of all establishment id's controlled by the principal
                var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(query.Principal));

                // return only users which are affiliated with the principal's establishments
                results = results.Where(x => x.TenantId.HasValue && ownedTenantIds.Contains(x.TenantId.Value));
            }

            results = results.OrderBy(query.OrderBy);
            return results;
        }
    }
}
