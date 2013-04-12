using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.People;


namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByPersonId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public EmployeeModuleSettingsByPersonId(int personId)
        {
            if (personId == 0) throw new ArgumentNullException("personId");

            PersonId = personId;
        }

        public int PersonId { get; private set; }
        internal Person Person { get; set; }
    }

    public class HandleEmployeeModuleSettingsByPersonIdQuery : IHandleQueries<EmployeeModuleSettingsByPersonId, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;

        public HandleEmployeeModuleSettingsByPersonIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeModuleSettings Handle(EmployeeModuleSettingsByPersonId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var person = query.Person ?? 
                _entities.Query<Person>()
                    .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                    {
                        // have to navigate to person for default establishment
                        x => x.Affiliations.Select(y => y.Establishment)
                    })
                    .SingleOrDefault(x => x.RevisionId == query.PersonId);
            if (person == null || person.DefaultAffiliation == null) return null;

            // default affiliation already links users to an establishment based on email domain
            var establishment = person.DefaultAffiliation.Establishment;

            // get the closest employee settings to this user's default affiliation
            EmployeeModuleSettings employeeModuleSettings = null;
            while (employeeModuleSettings == null && establishment != null)
            {
                employeeModuleSettings = _entities.Query<EmployeeModuleSettings>()
                    .EagerLoad(_entities, query.EagerLoad)
                    .SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
                establishment = establishment.Parent; // If this is null, head up the tree until we hit one
            }

            if ((employeeModuleSettings != null) && (employeeModuleSettings.ActivityTypes != null))
            {
                employeeModuleSettings.ActivityTypes =
                    employeeModuleSettings.ActivityTypes.OrderBy(e => e.Rank).ToArray();
            }

            return employeeModuleSettings;

            //var user = _entities.Query<User>()
            //            .SingleOrDefault(x => x.Person.RevisionId == query.PersonId);
            //if (user == null) return null;
            //
            //if (user == null) { throw new Exception("Uable to find person with id " + query.PersonId); }
            //
            //var domain = user.Name.GetEmailDomain();
            //
            //var establishment = _entities.Query<Establishment>()
            //                        .FirstOrDefault(x => x.EmailDomains.Any(e => e.Value == domain));
            //
            //if (establishment == null) { throw new Exception("Uable to find establishment with domain " + domain); }
            //
            //* If this is not root, head up the tree until we hit it. */
            //while ((establishment != null) && (establishment.Parent != null))
            //{
            //    establishment = _entities.Query<Establishment>()
            //                            .FirstOrDefault(x => x.RevisionId == establishment.Parent.RevisionId);
            //}
            //
            //if (establishment == null) { throw new Exception("Uable to find root establishment"); }
            //
            //return _entities.Query<EmployeeModuleSettings>()
            //        .SingleOrDefault(x => x.Establishment.RevisionId == establishment.RevisionId);
        }   //
    }
}
