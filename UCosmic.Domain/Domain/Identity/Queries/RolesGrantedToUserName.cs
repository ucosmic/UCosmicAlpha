using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class RolesGrantedToUserName : BaseEntitiesQuery<Role>, IDefineQuery<Role[]>
    {
        public RolesGrantedToUserName(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
                throw new ArgumentException("User name cannot be null or whitespace.", "userName");

            UserName = userName;
        }

        public string UserName { get; private set; }
    }

    public class HandleRolesGrantedToUserNameQuery : IHandleQueries<RolesGrantedToUserName, Role[]>
    {
        private readonly IQueryEntities _entities;

        public HandleRolesGrantedToUserNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Role[] Handle(RolesGrantedToUserName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Role>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Grants.Any(y => y.User.Name.Equals(query.UserName, StringComparison.OrdinalIgnoreCase)))
                .ToArray()
            ;
        }
    }
}
