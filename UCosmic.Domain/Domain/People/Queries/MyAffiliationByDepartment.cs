using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class MyAffiliationByDepartment : BaseEntityQuery<Affiliation>, IDefineQuery<Affiliation>
    {
        public MyAffiliationByDepartment(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class HandleMyAffiliationByDepartmentQuery : IHandleQueries<MyAffiliationByDepartment, Affiliation>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyAffiliationByDepartmentQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public Affiliation Handle(MyAffiliationByDepartment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var user = _entities.Query<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    x => x.Person,
                })
                .SingleOrDefault(x => x.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase));
            if (user == null) return null;

            return _queryProcessor.Execute(new AffiliationByDepartment(
                user.Person.RevisionId, query.EstablishmentId, query.CampusId, query.CollegeId, query.DepartmentId));
        }
    }
}
