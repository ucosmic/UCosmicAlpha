using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeModuleSettingsByEstablishmentId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public int EstablishmentId { get; private set; }
        public bool Seeding { get; set; }

        public EmployeeModuleSettingsByEstablishmentId(int establishmentId, bool seeding = false)
        {
            if (establishmentId == 0) throw new ArgumentNullException("establishmentId");

            EstablishmentId = establishmentId;
            Seeding = seeding;
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

            var ancestry = _entities.Query<EstablishmentNode>()
                .Where(x => x.OffspringId == query.EstablishmentId)
                .Select(x => x.AncestorId)
                .Concat(new[] { query.EstablishmentId });
            var queryable = _entities.Query<EmployeeModuleSettings>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => ancestry.Contains(x.Establishment.RevisionId))
                .OrderByDescending(x => x.Establishment.Ancestors.Count)
                .AsQueryable()
            ;

            // TODO need to eager load the activity types since this is ordering
            // them below (though it shouldn't, the caller should eager load & order)
            queryable = _entities.EagerLoad(queryable, x => x.ActivityTypes);
            var employeeModuleSettings = queryable.FirstOrDefault();

            //var establishment = _queryProcessor.Execute(new EstablishmentById(query.EstablishmentId));
            //if (establishment == null) throw new Exception("Establishment not found");
            //
            // EmployeeModuleSettings are related to root establishment.
            //if (establishment.Parent != null)
            //{
            //    while (establishment.Parent != null)
            //    {
            //        establishment = establishment.Parent;
            //    }
            //}

            //int establishmentId = establishment.RevisionId;
            //int establishmentId = employeeModuleSettings.Establishment.RevisionId;

            //var employeeModuleSettings = _entities.Query<EmployeeModuleSettings>()
            //    .EagerLoad(_entities, query.EagerLoad)
            //    .SingleOrDefault(p => p.Establishment.RevisionId == establishmentId);

            // TODO: this should always return null when no settings could be found
            if (!query.Seeding && employeeModuleSettings == null)
            {
                employeeModuleSettings = new EmployeeModuleSettings();
            }

            // TODO: clients should eager load & order by, not the query (unless requested in query object)
            if ((employeeModuleSettings != null) &&
                 (employeeModuleSettings.ActivityTypes != null) &&
                 (employeeModuleSettings.ActivityTypes.Count > 0))
            {
                employeeModuleSettings.ActivityTypes =  employeeModuleSettings.ActivityTypes.OrderBy(e => e.Rank).ToArray();
            }

            return employeeModuleSettings;
        }
    }
}
