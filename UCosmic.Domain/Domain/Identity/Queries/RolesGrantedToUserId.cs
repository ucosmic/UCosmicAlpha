using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class RolesGrantedToUserId : BaseEntitiesQuery<Role>, IDefineQuery<Role[]>
    {
        public RolesGrantedToUserId(IPrincipal principal, int userId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            UserId = userId;
        }

        public IPrincipal Principal { get; private set; }
        public int UserId { get; private set; }
    }

    public class HandleRolesGrantedToUserIdQuery : IHandleQueries<RolesGrantedToUserId, Role[]>
    {
        private readonly IQueryEntities _entities;

        public HandleRolesGrantedToUserIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Role[] Handle(RolesGrantedToUserId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Role>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Grants.Any(y => y.User.RevisionId == query.UserId))
                .ToArray()
            ;
        }
    }
}
