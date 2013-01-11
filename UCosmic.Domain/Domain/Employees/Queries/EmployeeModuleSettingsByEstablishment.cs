using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByEstablishment : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public Establishment Establishment { get; set; }

        public EmployeeModuleSettingsByEstablishment(Establishment establishment)
        {
            if (establishment == null) throw new ArgumentNullException("establishment");

            Establishment = establishment;
        }
    }

    internal static class QueryAffiliation
    {
        internal static EmployeeModuleSettings ByEstablishment(this IQueryable<EmployeeModuleSettings> queryable
            , Establishment establishment)
        {
            return queryable.SingleOrDefault(p => p.ForEstablishment.RevisionId == establishment.RevisionId);
        }
    }

    public class HandleEmployeeModuleSettingsByEstablishmentQuery : IHandleQueries<EmployeeModuleSettingsByEstablishment, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;

        public HandleEmployeeModuleSettingsByEstablishmentQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeModuleSettings Handle(EmployeeModuleSettingsByEstablishment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmployeeModuleSettings>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByEstablishment(query.Establishment)
            ;
        }
    }
}
