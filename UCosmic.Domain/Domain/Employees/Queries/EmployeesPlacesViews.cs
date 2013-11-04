using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class EmployeesPlacesViews : IDefineQuery<EmployeesPlacesView[]>
    {
        public EmployeesPlacesViews(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public EmployeesPlacesViews(string domain)
        {
            Domain = domain;
        }

        public int? EstablishmentId { get; private set; }
        public string Domain { get; private set; }
        public bool? Countries { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
    }

    public class HandleEmployeesPlacesViewsQuery : IHandleQueries<EmployeesPlacesViews, EmployeesPlacesView[]>
    {
        private readonly EmployeesPlacesViewProjector _projector;

        public HandleEmployeesPlacesViewsQuery(EmployeesPlacesViewProjector projector)
        {
            _projector = projector;
        }

        public EmployeesPlacesView[] Handle(EmployeesPlacesViews query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var viewEnumerable = query.EstablishmentId.HasValue
                ? _projector.Get(query.EstablishmentId.Value)
                : _projector.Get(query.Domain);

            var places = Enumerable.Empty<EmployeesPlacesView>().AsQueryable(); // hack an empty places queryable

            if (viewEnumerable == null)
                return places.ToArray();

            var view = viewEnumerable.ToArray();

            if (query.Countries.HasValue && query.Countries.Value)
            {
                var countries = view.Where(x => x.IsCountry);
                places = places.Union(countries).Distinct();
            }

            if (query.PlaceIds != null && query.PlaceIds.Any())
            {
                var byId = view.Where(x => query.PlaceIds.Contains(x.PlaceId));
                places = places.Union(byId).Distinct();
            }

            return places.ToArray();
        }
    }
}
