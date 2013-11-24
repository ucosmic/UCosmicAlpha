using System;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class MyPerson : BaseEntityQuery<Person>, IDefineQuery<Person>
    {
        public MyPerson(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
    }

    public class HandleMyPersonQuery : IHandleQueries<MyPerson, Person>
    {
        private readonly IQueryEntities _entities;

        public HandleMyPersonQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Person Handle(MyPerson query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Person>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByUserName(query.Principal.Identity.Name)
            ;
        }
    }
}
