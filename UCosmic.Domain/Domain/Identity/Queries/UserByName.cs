using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class UserByName : BaseEntityQuery<User>, IDefineQuery<User>
    {
        public string Name { get; set; }
    }

    public class HandleUserByNameQuery : IHandleQueries<UserByName, User>
    {
        private readonly ICommandEntities _entities;

        public HandleUserByNameQuery(ICommandEntities entities)
        {
            _entities = entities;
        }

        public User Handle(UserByName query)
        {
            return _entities.Query<User>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.Name.Equals(query.Name, StringComparison.OrdinalIgnoreCase))
            ;
        }
    }
}
