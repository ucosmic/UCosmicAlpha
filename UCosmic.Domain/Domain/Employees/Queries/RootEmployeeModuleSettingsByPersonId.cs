using System;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;


namespace UCosmic.Domain.Employees
{
    public class RootEmployeeModuleSettingsByPersonId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public int PersonId { get; set; }

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

            var domain = user.Name.GetEmailDomain();

            var establishment = _entities.Query<Establishment>()
                                    .FirstOrDefault(x => x.EmailDomains.Any(e => e.Value == domain) && x.Parent == null);

            return _entities.Query<EmployeeModuleSettings>()
                    .SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
        }
    }
}
