using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByUserName : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public string UserName { get; private set; }

        public EmployeeModuleSettingsByUserName(string userName)
        {
            if (userName == null) throw new ArgumentNullException("userName");

            UserName = userName;
        }
    }

    public class HandleEmployeeModuleSettingsByUserNameQuery : IHandleQueries<EmployeeModuleSettingsByUserName, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleEmployeeModuleSettingsByUserNameQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public EmployeeModuleSettings Handle(EmployeeModuleSettingsByUserName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var user = _entities.Query<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    // have to navigate to person for default establishment
                    x => x.Person.Affiliations.Select(y => y.Establishment)
                })
                .ByName(query.UserName);
            if (user == null || user.Person == null || user.Person.DefaultAffiliation == null) return null;
            return _queryProcessor.Execute(new EmployeeModuleSettingsByPersonId(user.Person.RevisionId)
                {
                    Person = user.Person,
                });

            //var domain = query.UserName.GetEmailDomain();

            //var establishment = _entities.Query<Establishment>()
            //                        .FirstOrDefault(x => x.EmailDomains.Any(e => e.Value == domain));

            //if (establishment == null) { throw new Exception("Uable to find establishment with domain " + domain); }

            //* If this is not root, head up the tree until we hit it. */
            //while ((establishment != null) && (establishment.Parent != null))
            //{
            //    establishment = _entities.Query<Establishment>()
            //                            .FirstOrDefault(x => x.RevisionId == establishment.Parent.RevisionId);
            //}

            //if (establishment == null) { throw new Exception("Uable to find root establishment"); }
            //
            //return _entities.Query<EmployeeModuleSettings>()
            //        .SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
        }
    }
}
