using System;
using System.Linq;
using UCosmic.Domain.Establishments;


namespace UCosmic.Domain.Employees
{
    public class RootEmployeeModuleSettingsByUserName : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public string UserName { get; private set; }

        public RootEmployeeModuleSettingsByUserName(string userName)
        {
            if (userName == null) throw new ArgumentNullException("userName");

            UserName = userName;
        }
    }

    public class HandleRootEmployeeModuleSettingsByUserNameQuery : IHandleQueries<RootEmployeeModuleSettingsByUserName, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;

        public HandleRootEmployeeModuleSettingsByUserNameQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeModuleSettings Handle(RootEmployeeModuleSettingsByUserName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var domain = query.UserName.GetEmailDomain();

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
