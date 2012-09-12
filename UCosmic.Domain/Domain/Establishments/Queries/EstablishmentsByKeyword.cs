using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByKeyword : BaseViewsQuery<EstablishmentView>, IDefineQuery<PagedQueryResult<EstablishmentView>>
    {
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public PagedQueryRequest Pager { get; set; }
    }

    public class HandleEstablishmentsByKeywordQuery : IHandleQueries<EstablishmentsByKeyword, PagedQueryResult<EstablishmentView>>
    {
        private readonly EstablishmentViewProjector _projector;

        public HandleEstablishmentsByKeywordQuery(EstablishmentViewProjector projector)
        {
            _projector = projector;
        }

        public PagedQueryResult<EstablishmentView> Handle(EstablishmentsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var view = _projector.GetView().AsQueryable();
            
            // when the query's country code is empty string, match all establishments regardless of country.
            // when the query's country code is null, match establishments without country
            if (query.CountryCode == null)
            {
                view = view.Where(x => string.IsNullOrWhiteSpace(x.CountryCode));
            }
            // when the country code is specified, match establishments with country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                view = view.Where(x => x.CountryCode.Equals(query.CountryCode, StringComparison.OrdinalIgnoreCase));
            }

            var pagedResults = new PagedQueryResult<EstablishmentView>(view, query.Pager);

            return pagedResults;
        }
    }
}