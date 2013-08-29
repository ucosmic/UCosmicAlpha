using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByEstablishmentId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public int EstablishmentId { get; private set; }

        public EmployeeModuleSettingsByEstablishmentId(int establishmentId)
        {
            if (establishmentId == 0) throw new ArgumentNullException("establishmentId");

            EstablishmentId = establishmentId;
        }
    }

    public class HandleEmployeeModuleSettingsByEstablishmentIdQuery : IHandleQueries<EmployeeModuleSettingsByEstablishmentId, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleEmployeeModuleSettingsByEstablishmentIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public EmployeeModuleSettings Handle(EmployeeModuleSettingsByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var establishment = _queryProcessor.Execute(new EstablishmentById(query.EstablishmentId));
            if (establishment == null) throw new Exception("Establishment not found");

            /* EmployeeModuleSettings are related to root establishment. */
            if (establishment.Parent != null)
            {
                while (establishment.Parent != null)
                {
                    establishment = establishment.Parent;
                }
            }

            int establishmentId = establishment.RevisionId;
                
            var employeeModuleSettings = _entities.Query<EmployeeModuleSettings>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(p => p.Establishment.RevisionId == establishmentId);

            if (employeeModuleSettings != null)
            {
                employeeModuleSettings.ActivityTypes.OrderBy(a => a.Rank);
            }

            return employeeModuleSettings;
        }
    }
}
