using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class MyPeople : BaseEntitiesQuery<Person>, IDefineQuery<IQueryable<Person>>
    {
        internal MyPeople(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
    }

    public class HandleMyPeopleQuery : IHandleQueries<MyPeople, IQueryable<Person>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyPeopleQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public IQueryable<Person> Handle(MyPeople query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Person>()
                .EagerLoad(_entities, query.EagerLoad);

            // only return users controlled by the requesting principal
            if (!query.Principal.IsInRole(RoleName.AuthenticationAgent) && // only agents are tenant agnostic
                !query.Principal.IsInRole(RoleName.AuthorizationAgent)) // filter to the non-agent's tenant
            {
                // get the user account & default affiliation for the requesting principal
                var person = _queryProcessor.Execute(new PersonByEmail(query.Principal.Identity.Name)
                {
                    EagerLoad = new Expression<Func<Person, object>>[]
                    {
                        x => x.Affiliations,
                    }
                });

                if ((person != null) && (person.DefaultAffiliation != null))
                {
                    int tenantId = person.DefaultAffiliation.EstablishmentId;

                    // get the pk's of all establishments under the default affiliation
                    var controlledEstablishmentIds = _entities.Query<Establishment>()
                                                              .Where(
                                                                  x =>
                                                                  x.Ancestors.Any(
                                                                      y => y.Ancestor.RevisionId == tenantId))
                                                              .Select(x => x.RevisionId).ToList();
                    controlledEstablishmentIds.Add(tenantId); // add the default affiliation to offspring

                    // filter results to exclude users not controlled by the requesting principal
                    results = results.Where(x => x.Affiliations.Any(y =>
                                                                           (y.IsDefault &&
                                                                            controlledEstablishmentIds.Contains(
                                                                                y.EstablishmentId))
                                                     ));
                }
                else
                {
                    results = Enumerable.Empty<Person>().AsQueryable();
                }
            }

            results = query.OrderBy != null ? results.OrderBy(query.OrderBy) : results.OrderBy(x => x.RevisionId);
            return results;
        }
    }
}
