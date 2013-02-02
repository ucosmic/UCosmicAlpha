using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class PersonByGuid : BaseEntityQuery<Person>, IDefineQuery<Person>
    {
        public PersonByGuid(Guid guid)
        {
            if (guid == Guid.Empty)
                throw new ArgumentException("Cannot be empty", "guid");
            Guid = guid;
        }

        public Guid Guid { get; private set; }
    }

    public class HandlePersonByGuidQuery : IHandleQueries<PersonByGuid, Person>
    {
        private readonly IQueryEntities _entities;

        public HandlePersonByGuidQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Person Handle(PersonByGuid query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Person>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.EntityId == query.Guid)
            ;
        }
    }
}
