using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Identity
{
    public class MyUsers : BaseEntitiesQuery<User>, IDefineQuery<IQueryable<User>>
    {
        internal MyUsers(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
    }

    public class HandleMyUsersQuery : IHandleQueries<MyUsers, IQueryable<User>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyUsersQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public IQueryable<User> Handle(MyUsers query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<User>()
                .EagerLoad(_entities, query.EagerLoad);

            // only return users controlled by the requesting principal
            if (!query.Principal.IsInRole(RoleName.AuthenticationAgent) && // only agents are tenant agnostic
                !query.Principal.IsInRole(RoleName.AuthorizationAgent)) // filter to the non-agent's tenant
            {
                // get the user account & default affiliation for the requesting principal
                var user = _queryProcessor.Execute(new UserByName(query.Principal.Identity.Name)
                {
                    EagerLoad = new Expression<Func<User, object>>[]
                    {
                        x => x.Person.Affiliations,
                    }
                });

                int? tenantId = user.Person.DefaultAffiliation.EstablishmentId;

                // get the pk's of all establishments under the default affiliation
                var controlledEstablishmentIds = _entities.Query<Establishment>()
                    .Where(x => x.Ancestors.Any(y => y.Ancestor.RevisionId == tenantId.Value))
                    .Select(x => x.RevisionId).ToList();
                controlledEstablishmentIds.Add(tenantId.Value); // add the default affiliation to offspring

                // filter results to exclude users not controlled by the requesting principal
                results = results.Where(x => x.Person.Affiliations.Any(y =>
                    (y.IsDefault && controlledEstablishmentIds.Contains(y.EstablishmentId))
                ));
            }

            results = query.OrderBy != null ? results.OrderBy(query.OrderBy) : results.OrderBy(x => x.RevisionId);
            return results;
        }
    }
}
