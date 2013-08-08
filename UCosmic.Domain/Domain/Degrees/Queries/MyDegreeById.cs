using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Degrees
{
    public class MyDegreeById : BaseEntityQuery<Degree>, IDefineQuery<Degree>
    {
        public MyDegreeById(IPrincipal principal, int degreeId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = degreeId;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class HandleMyDegreeByIdQuery : IHandleQueries<MyDegreeById, Degree>
    {
        private readonly IQueryEntities _entities;

        public HandleMyDegreeByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Degree Handle(MyDegreeById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var result = _entities.Query<Degree>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(x => x.RevisionId == query.Id && x.Person.User != null &&
                    x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase));

            return result;
        }
    }
}
