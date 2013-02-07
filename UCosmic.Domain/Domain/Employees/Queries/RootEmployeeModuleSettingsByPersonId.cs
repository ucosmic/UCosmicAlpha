using System;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;


namespace UCosmic.Domain.Employees
{
    public class RootEmployeeModuleSettingsByPersonId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public int PersonId { get; private set; }

        public RootEmployeeModuleSettingsByPersonId(int personId)
        {
            if (personId == 0) throw new ArgumentNullException("personId");

            PersonId = personId;
        }
    }

    public class HandleRootEmployeeModuleSettingsByPersonIdQuery : IHandleQueries<RootEmployeeModuleSettingsByPersonId, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;

        public HandleRootEmployeeModuleSettingsByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeModuleSettings Handle(RootEmployeeModuleSettingsByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var user = _entities.Query<User>()
                        .SingleOrDefault(x => x.Person.RevisionId == query.PersonId);
            if (user == null) return null;

            if (user == null) { throw new Exception("Uable to find person with id " + query.PersonId); }

            var domain = user.Name.GetEmailDomain();

            var establishment = _entities.Query<Establishment>()
                                    .FirstOrDefault(x => x.EmailDomains.Any(e => e.Value == domain));

            if (establishment == null) { throw new Exception("Uable to find establishment with domain " + domain); }

            /* If this is not root, head up the tree until we hit it. */
            while ((establishment != null) && (establishment.Parent != null))
            {
                establishment = _entities.Query<Establishment>()
                                        .FirstOrDefault(x => x.RevisionId == establishment.Parent.RevisionId);
            }

            if (establishment == null) { throw new Exception("Uable to find root establishment"); }

            return _entities.Query<EmployeeModuleSettings>()
                    .SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
        }
    }
}
