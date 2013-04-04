using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class UserById : BaseEntityQuery<User>, IDefineQuery<User>
    {
        public UserById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleUserByIdQuery : IHandleQueries<UserById, User>
    {
        private readonly IQueryEntities _entities;

        public HandleUserByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public User Handle(UserById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<User>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id)
            ;
        }
    }
}
