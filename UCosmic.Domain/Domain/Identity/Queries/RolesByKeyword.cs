using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class RolesByKeyword : BaseEntitiesQuery<Role>, IDefineQuery<PagedQueryResult<Role>>
    {
        public RolesByKeyword(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public string Keyword { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleRolesByKeywordQuery : IHandleQueries<RolesByKeyword, PagedQueryResult<Role>>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleRolesByKeywordQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PagedQueryResult<Role> Handle(RolesByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new RolesUnfiltered(query.Principal)
            {
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var loweredKeyword = query.Keyword.ToLower();
                internalQueryable = internalQueryable.Where(x =>
                    x.Name.ToLower().Contains(loweredKeyword) ||
                    x.Description.ToLower().Contains(loweredKeyword)
                );
            }


            var pagedResults = new PagedQueryResult<Role>(internalQueryable, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}
