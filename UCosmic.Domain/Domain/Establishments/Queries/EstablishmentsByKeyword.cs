using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentsByKeyword : BaseViewsQuery<EstablishmentView>, IDefineQuery<PagedQueryResult<EstablishmentView>>
    {
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
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
            const StringComparison ordinalIgnoreCase = StringComparison.OrdinalIgnoreCase;
            
            // when the query's country code is empty string, match all establishments regardless of country.
            // when the query's country code is null, match establishments without country
            if (query.CountryCode == null)
            {
                view = view.Where(x => string.IsNullOrWhiteSpace(x.CountryCode));
            }
            // when the country code is specified, match establishments with country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                view = view.Where(x => x.CountryCode.Equals(query.CountryCode, ordinalIgnoreCase));
            }

            // search names & URL's for keyword
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                view = view.Where(x =>
                    x.Names.Any(y =>
                        y.Text.Contains(query.Keyword, ordinalIgnoreCase)
                        || y.AsciiEquivalent.Contains(query.Keyword, ordinalIgnoreCase)
                    )
                    //|| x.WebsiteUrl.Contains(query.Keyword, ordinalIgnoreCase) TODO: fix usil.edu.pe & possibly others
                    || x.Urls.Any(y => y.Value.Contains(query.Keyword, ordinalIgnoreCase))
                    || x.CeebCode.Contains(query.Keyword, ordinalIgnoreCase)
                    || x.UCosmicCode.Contains(query.Keyword, ordinalIgnoreCase)
                );
            }

            view = view.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<EstablishmentView>(view, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}