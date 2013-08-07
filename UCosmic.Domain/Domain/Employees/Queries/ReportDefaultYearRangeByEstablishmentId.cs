using System;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class ReportDefaultYearRangeByEstablishmentId : BaseEntityQuery<EmployeeModuleSettings>, IDefineQuery<int?>
    {
        public int EstablishmentId { get; private set; }

        public ReportDefaultYearRangeByEstablishmentId(int establishmentId)
        {
            if (establishmentId == 0) throw new ArgumentNullException("establishmentId");

            EstablishmentId = establishmentId;
        }
    }

    public class HandleReportDefaultYearRangeByEstablishmentIdQuery : IHandleQueries<ReportDefaultYearRangeByEstablishmentId, int?>
    {
        private readonly IQueryEntities _entities;

        public HandleReportDefaultYearRangeByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int? Handle(ReportDefaultYearRangeByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            int? range = null;

            EmployeeModuleSettings settings = _entities.Query<EmployeeModuleSettings>()
                .SingleOrDefault(p => p.Establishment.RevisionId == query.EstablishmentId);

            if (settings != null)
            {
                range = settings.ReportsDefaultYearRange;
            }

            return range;
        }
    }
}
