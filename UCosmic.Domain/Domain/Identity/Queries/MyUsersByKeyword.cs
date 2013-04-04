using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class MyUsersByKeyword : BaseEntitiesQuery<User>, IDefineQuery<PagedQueryResult<User>>
    {
        public MyUsersByKeyword(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public string Keyword { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class HandleMyUsersByKeywordQuery : IHandleQueries<MyUsersByKeyword, PagedQueryResult<User>>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleMyUsersByKeywordQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public PagedQueryResult<User> Handle(MyUsersByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new MyUsers(query.Principal)
            {
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            // filter by keyword
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var loweredKeyword = query.Keyword.ToLower();
                internalQueryable = internalQueryable.Where(x =>
                    x.Name.ToLower().Contains(loweredKeyword) ||
                    x.Person.DisplayName.ToLower().Contains(loweredKeyword) ||
                    (x.Person.LastName != null && x.Person.LastName.ToLower().Contains(loweredKeyword)) ||
                    (x.Person.FirstName != null && x.Person.FirstName.ToLower().Contains(loweredKeyword)) ||
                    (x.Person.MiddleName != null && x.Person.MiddleName.ToLower().Contains(loweredKeyword)) ||
                    x.Person.Emails.Any(y => y.Value.ToLower().Contains(loweredKeyword)) ||
                    x.Grants.Any(y => y.Role.Name.ToLower().Contains(loweredKeyword))
                );
            }

            var pagedResults = new PagedQueryResult<User>(internalQueryable, query.PageSize, query.PageNumber);

            // only return role grants that the querying user is allowed to see
            if (!query.Principal.IsInRole(RoleName.AuthorizationAgent))
            {
                foreach (var user in pagedResults.Items)
                {
                    var allGrants = user.Grants;
                    var allowedGrants = new List<RoleGrant>();
                    foreach (var grant in allGrants)
                    {
                        if (!RoleName.NonTenantRoles.Contains(grant.Role.Name))
                        {
                            allowedGrants.Add(grant);
                        }
                    }
                    user.Grants = allowedGrants;
                }
            }

            return pagedResults;
        }
    }
}
