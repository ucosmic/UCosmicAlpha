using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.People
{
    public class PersonViewModelById : BaseEntityQuery<Person>, IDefineQuery<Person>
    {
        public PersonViewModelById(IPrincipal principal, int personId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int PersonId { get; private set; }
    }

    //public class HandlePersonViewModelByIdQuery : IHandleQueries<PersonViewModelById, Person>
    //{
    //    private readonly IQueryEntities _entities;

    //    public HandlePersonViewModelByIdQuery(IQueryEntities entities)
    //    {
    //        _entities = entities;
    //    }

    //    public Person Handle(PersonViewModelById query)
    //    {
    //        if (query == null) throw new ArgumentNullException("query");

    //        //var publicText = ActivityMode.Public.AsSentenceFragment();
    //        Person result = new Person();
    //        //var result = _entities.Query<Person>()
    //        //    .EagerLoad(_entities, query.EagerLoad)
    //        //    //.SingleOrDefault(x => x.ActivityId == query.ActivityId && x.ModeText == publicText && x.Activity.ModeText == publicText)
    //        //;
    //        return result;
    //    }
    //}
}
