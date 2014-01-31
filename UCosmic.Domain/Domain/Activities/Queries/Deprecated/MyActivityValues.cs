//using System;
//using System.Linq;
//using System.Security.Principal;

//namespace UCosmic.Domain.Activities
//{
//    public class MyActivityValues : BaseEntitiesQuery<ActivityValues>, IDefineQuery<PagedQueryResult<ActivityValues>>
//    {
//        public MyActivityValues(IPrincipal principal)
//        {
//            if (principal == null) throw new ArgumentNullException("principal");
//            Principal = principal;
//        }

//        public IPrincipal Principal { get; private set; }
//        public int PageSize { get; set; }
//        public int PageNumber { get; set; }
//    }

//    public class HandleMyActivityValuesQuery : IHandleQueries<MyActivityValues, PagedQueryResult<ActivityValues>>
//    {
//        private readonly IQueryEntities _entities;

//        public HandleMyActivityValuesQuery(IQueryEntities entities)
//        {
//            _entities = entities;
//        }

//        public PagedQueryResult<ActivityValues> Handle(MyActivityValues query)
//        {
//            if (query == null) throw new ArgumentNullException("query");

//            var queryable = _entities.Query<ActivityValues>()
//                .EagerLoad(_entities, query.EagerLoad)
//                .Where(x => x.Activity.Person.User != null &&
//                    x.Activity.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase) &&
//                    //x.Activity.Values.Any(y => y.ModeText == x.ModeText) && x.Activity.Original == null
//                    x.ModeText == x.Activity.ModeText &&
//                    x.Activity.Original == null
//                )
//                .OrderBy(query.OrderBy)
//            ;

//            var pagedResults = new PagedQueryResult<ActivityValues>(queryable, query.PageSize, query.PageNumber);

//            return pagedResults;
//        }
//    }
//}
