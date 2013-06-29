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
        private readonly IHandleCommands<EnsureUserTenancy> _ensureTenancy;

        public HandleMyOwnedTenantIdsQuery(IQueryEntities entities
            , IHandleCommands<EnsureUserTenancy> ensureTenancy
        )
        {
            _entities = entities;
            _ensureTenancy = ensureTenancy;
        }

        public IQueryable<int> Handle(MyOwnedTenantIds query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // make sure user has a tenant id
            var ensuredTenancy = new EnsureUserTenancy(query.Principal.Identity.Name);
            _ensureTenancy.Handle(ensuredTenancy);

            // only return tenants that fall under the query principal
            var ownedIds = new List<int>();
            var user = ensuredTenancy.EnsuredUser;
            if (user != null && user.TenantId.HasValue)
                ownedIds.Add(user.TenantId.Value);

            //if (ownedIds.Any()) // include all establishments downstream from the tenant (its offspring)
            //    ownedIds.AddRange(_entities.Query<EstablishmentNode>()
            //        .Where(x => x.AncestorId == ownedIds.FirstOrDefault())
            //        .Select(x => x.OffspringId));

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
