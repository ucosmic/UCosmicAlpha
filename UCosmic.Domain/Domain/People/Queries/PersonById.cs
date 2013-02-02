using System;
using System.Linq;

namespace UCosmic.Domain.People
{
    public class PersonById : BaseEntityQuery<Person>, IDefineQuery<Person>
    {
        public PersonById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandlePersonByIdQuery : IHandleQueries<PersonById, Person>
    {
        private readonly IQueryEntities _entities;

        public HandlePersonByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Person Handle(PersonById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Person>()
                            .EagerLoad(_entities, query.EagerLoad)
                            .SingleOrDefault(p => p.RevisionId == query.Id);
        }
    }
}
