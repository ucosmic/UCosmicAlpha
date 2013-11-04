using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Employees
{
    public class EmployeePlaceViews : IDefineQuery<EmployeePlacesView[]>
    {
        public EmployeePlaceViews(int establishmentId)
        {
            EstablishmentId = establishmentId;
        }

        public EmployeePlaceViews(string domain)
        {
            Domain = domain;
        }

        public int? EstablishmentId { get; private set; }
        public string Domain { get; private set; }
        public bool? Countries { get; set; }
        public IEnumerable<int> PlaceIds { get; set; }
    }

    public class HandleEmployeePlaceViewsQuery : IHandleQueries<EmployeePlaceViews, EmployeePlacesView[]>
    {
        private readonly EmployeePlacesViewProjector _projector;

        public HandleEmployeePlaceViewsQuery(EmployeePlacesViewProjector projector)
        {
            _projector = projector;
        }

        public EmployeePlacesView[] Handle(EmployeePlaceViews query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var viewEnumerable = query.EstablishmentId.HasValue
                ? _projector.Get(query.EstablishmentId.Value)
                : _projector.Get(query.Domain);

            var places = Enumerable.Empty<EmployeePlacesView>().AsQueryable(); // hack an empty places queryable

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
