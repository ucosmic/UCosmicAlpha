using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class UserByName : BaseEntityQuery<User>, IDefineQuery<User>
    {
        public UserByName(string name)
        {
            if (name == null) throw new ArgumentNullException("name");
            Name = name;
        }

        public string Name { get; private set; }
    }

    public class HandleUserByNameQuery : IHandleQueries<UserByName, User>
    {
        private readonly IQueryEntities _entities;

        public HandleUserByNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public User Handle(UserByName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<User>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.Name.Equals(query.Name, StringComparison.OrdinalIgnoreCase))
            ;
        }
    }
}
