using System;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeActivityCountsViewByEstablishment : IDefineQuery<EmployeeActivityCountsView>
    {
        public EmployeeActivityCountsViewByEstablishment(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public EmployeeActivityCountsViewByEstablishment(string domain)
        {
            Domain = domain;
        }

        public int? EstablishmentId { get; private set; }
        public string Domain { get; private set; }
    }

    public class HandleEmployeeActivityCountsViewByEstablishmentQuery : IHandleQueries<EmployeeActivityCountsViewByEstablishment, EmployeeActivityCountsView>
    {
        private readonly EmployeeActivityCountsViewProjector _projector;
        private readonly IProcessQueries _queryProcessor;

        public HandleEmployeeActivityCountsViewByEstablishmentQuery(EmployeeActivityCountsViewProjector projector, IProcessQueries queryProcessor)
        {
            _projector = projector;
            _queryProcessor = queryProcessor;
        }

        public EmployeeActivityCountsView Handle(EmployeeActivityCountsViewByEstablishment query)
        {
            if (query == null) throw new ArgumentNullException("query");

            //var view = query.EstablishmentId.HasValue
            //    ? _projector.Get(query.EstablishmentId.Value)
            //    : _projector.Get(query.Domain);

            //if (view != null) return view;

            var emptyView = new EmployeeActivityCountsView();
            if (query.EstablishmentId.HasValue)
            {
                emptyView.EstablishmentId = query.EstablishmentId.Value;
            }
            else
            {
                var establishment = _queryProcessor.Execute(new EstablishmentByDomain(query.Domain));
                if (establishment != null)
                    emptyView.EstablishmentId = establishment.RevisionId;
            }
            return emptyView;
        }
    }
}
