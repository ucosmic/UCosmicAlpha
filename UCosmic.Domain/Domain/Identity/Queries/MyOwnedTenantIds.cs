using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Identity
{
    public class MyOwnedTenantIds : IDefineQuery<IQueryable<int>>
    {
        internal MyOwnedTenantIds(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
    }

    public class HandleMyOwnedTenantIdsQuery : IHandleQueries<MyOwnedTenantIds, IQueryable<int>>
    {
        private readonly IQueryEntities _entities;

        public HandleMyOwnedTenantIdsQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IQueryable<int> Handle(MyOwnedTenantIds query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // only return tenants that fall under the query principal
            var ownedIds = new List<int>();
            var user = _entities.Query<User>().SingleOrDefault(x =>
                x.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase));
            if (user != null && user.TenantId.HasValue)
                ownedIds.Add(user.TenantId.Value);

            if (ownedIds.Any())
            {
                return _entities.Query<EstablishmentNode>()
                    .Where(x => x.AncestorId == ownedIds.FirstOrDefault())
                    .Select(x => x.OffspringId).Union(ownedIds);
            }

            return ownedIds.AsQueryable();
        }
    }
}
