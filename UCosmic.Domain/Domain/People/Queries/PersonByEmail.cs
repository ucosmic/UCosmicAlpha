using System;

namespace UCosmic.Domain.People
{
    public class PersonByEmail : BaseEntityQuery<Person>, IDefineQuery<Person>
    {
        public string Email { get; set; }
    }

    public class HandlePersonByEmailQuery : IHandleQueries<PersonByEmail, Person>
    {
        private readonly IQueryEntities _entities;

        public HandlePersonByEmailQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Person Handle(PersonByEmail query)
        {
            if (query == null) throw new ArgumentNullException("query");

            if (string.IsNullOrWhiteSpace(query.Email)) return null;

            return _entities.Query<Person>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByEmail(query.Email)
            ;
        }
    }
}
