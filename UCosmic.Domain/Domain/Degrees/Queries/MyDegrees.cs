using System;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class MyDegrees : BaseEntitiesQuery<Degree>, IDefineQuery<PagedQueryResult<Degree>>
    {
        public MyDegrees(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleMyDegreesQuery : IHandleQueries<MyDegrees, PagedQueryResult<Degree>>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleMyDegreesQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PagedQueryResult<Degree> Handle(MyDegrees query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var person = _queryProcessor.Execute(new MyPerson(query.Principal));
            return _queryProcessor.Execute(new DegreesByPersonId(person.RevisionId)
            {
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
            });
        }
    }
}
