using System;
using System.Linq;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeSettingsByEstablishment : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<EmployeeModuleSettings>
    {
        public EmployeeSettingsByEstablishment(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public EmployeeSettingsByEstablishment(string establishmentDomain)
        {
            EstablishmentDomain = establishmentDomain;
        }

        public int? EstablishmentId { get; private set; }
        public string EstablishmentDomain { get; private set; }
    }

    public class HandleEmployeeSettingsByEstablishmentQuery : IHandleQueries<EmployeeSettingsByEstablishment, EmployeeModuleSettings>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleEmployeeSettingsByEstablishmentQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public EmployeeModuleSettings Handle(EmployeeSettingsByEstablishment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // do we have a domain or an establishment id?
            var establishmentId = query.EstablishmentId ?? 0;
            if (establishmentId == 0)
            {
                var establishment = _queryProcessor.Execute(new EstablishmentByDomain(query.EstablishmentDomain));
                if (establishment != null)
                    establishmentId = establishment.RevisionId;
            }
            if (establishmentId == 0) return null;

            var ancestry = _entities.Query<EstablishmentNode>()
                .Where(x => x.OffspringId == establishmentId)
                .Select(x => x.AncestorId)
                .Concat(new[] { establishmentId });
            var queryable = _entities.Query<EmployeeModuleSettings>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => ancestry.Contains(x.EstablishmentId))
                .OrderByDescending(x => x.Establishment.Ancestors.Count)
                .AsQueryable()
            ;

            return queryable.FirstOrDefault();
        }
    }
}
