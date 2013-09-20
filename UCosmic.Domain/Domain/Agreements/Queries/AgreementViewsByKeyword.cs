using System;
using System.Linq;

namespace UCosmic.Domain.Agreements
{
    public class AgreementViewsByKeyword : BaseViewsQuery<AgreementView>, IDefineQuery<PagedQueryResult<AgreementView>>
    {
        public int? Id { get; set; }
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public string[] TypeEnglishNames { get; set; }
    }

    public class HandleAgreementViewsByKeywordQuery : IHandleQueries<AgreementViewsByKeyword, PagedQueryResult<AgreementView>>
    {
        private readonly AgreementViewProjector _projector;

        public HandleAgreementViewsByKeywordQuery(AgreementViewProjector projector)
        {
            _projector = projector;
        }

        public PagedQueryResult<AgreementView> Handle(AgreementViewsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var possibleNullView = _projector.GetView();
            if (possibleNullView == null)
            {
                System.Threading.Thread.Sleep(1000);
                return Handle(query);
            }
            var view = possibleNullView.AsQueryable();
            const StringComparison ordinalIgnoreCase = StringComparison.OrdinalIgnoreCase;

            //// when the query's country code is empty string, match all establishments regardless of country.
            //// when the query's country code is null, match establishments without country
            //if (query.CountryCode == null)
            //{
            //    view = view.Where(x => string.IsNullOrWhiteSpace(x.CountryCode));
            //}
            //// when the country code is specified, match establishments with country
            //else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            //{
            //    view = view.Where(x => x.CountryCode.Equals(query.CountryCode, ordinalIgnoreCase));
            //}

            ////search names & URL's for keyword
            //if (!string.IsNullOrWhiteSpace(query.Keyword))
            //{
            //    view = view.Where(x =>
            //        x.Names.Any(y =>
            //            y.Text.Contains(query.Keyword, ordinalIgnoreCase)
            //            || y.AsciiEquivalent.Contains(query.Keyword, ordinalIgnoreCase)
            //        )
            //            //|| x.WebsiteUrl.Contains(query.Keyword, ordinalIgnoreCase) TODO: fix usil.edu.pe & possibly others
            //        || x.Urls.Any(y => y.Value.Contains(query.Keyword, ordinalIgnoreCase))
            //        || x.CeebCode.Contains(query.Keyword, ordinalIgnoreCase)
            //        || x.UCosmicCode.Contains(query.Keyword, ordinalIgnoreCase)
            //    );
            //}

            //if (query.TypeEnglishNames != null && query.TypeEnglishNames.Any())
            //    view = view.Where(x => query.TypeEnglishNames.Contains(x.Type.EnglishName));

            if (query.Id.HasValue)
                view = view.Where(x => x.Id == query.Id.Value);

            view = view.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<AgreementView>(view, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}