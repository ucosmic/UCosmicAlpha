using System;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByEstablishmentId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public int EstablishmentId { get; set; }

        public EmployeeModuleSettingsByEstablishmentId(int establishmentId)
        {
            if (establishmentId == 0) throw new ArgumentNullException("establishmentId");

            EstablishmentId = establishmentId;
        }
    }

    public class HandleEmployeeModuleSettingsByEstablishmentIdQuery : IHandleQueries<EmployeeModuleSettingsByEstablishmentId, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;

        public HandleEmployeeModuleSettingsByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public EmployeeModuleSettings Handle(EmployeeModuleSettingsByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<EmployeeModuleSettings>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(p => p.Establishment.RevisionId == query.EstablishmentId);
        }
    }
}
