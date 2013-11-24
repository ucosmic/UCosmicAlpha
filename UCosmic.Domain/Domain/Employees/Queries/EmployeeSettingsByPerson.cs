using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class EmployeeSettingsByPerson : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public EmployeeSettingsByPerson(IPrincipal principal, int? personId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int? PersonId { get; private set; }
    }

    public class HandleEmployeeSettingsByPersonQuery : IHandleQueries<EmployeeSettingsByPerson, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleEmployeeSettingsByPersonQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public EmployeeModuleSettings Handle(EmployeeSettingsByPerson query)
        {
            if (query == null) throw new ArgumentNullException("query");

            int? establishmentId;
            if (!query.PersonId.HasValue)
            {
                // get settings from user's default affiliation
                establishmentId = _entities.Query<Affiliation>()
                    .Where(x => x.IsDefault && x.Person.User != null && x.Person.User.Name.Equals(query.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase))
                    .Select(x => (int?)x.EstablishmentId).SingleOrDefault();
            }
            else
            {
                // otherwise, get settings for the person's default affiliation
                establishmentId = _entities.Query<Affiliation>()
                    .Where(x => x.IsDefault && x.PersonId == query.PersonId.Value)
                    .Select(x => (int?)x.EstablishmentId).SingleOrDefault();
            }

            return establishmentId.HasValue
                ? _queryProcessor.Execute(new EmployeeSettingsByEstablishment(establishmentId.Value))
                : null;
        }
    }
}
