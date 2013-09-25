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
        //public string orderBy { get; set; }
        //public string Expires { get; set; }
        //public string Starts { get; set; }
        //public string Type { get; set; }
        //public string Status { get; set; }
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
            //var asc_dsc = query.orderBy.Substring(query.orderBy.IndexOf("-") + 1);
            //query.orderBy = query.orderBy.Substring(0, query.orderBy.IndexOf("-"));
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
            //    view = view.Where(x => string.IsNullOrWhiteSpace(x..CountryCode));
            //}
            ////when the country code is specified, match establishments with country
            //else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            //{
            //    view = view.Where(x => x.CountryCode.Equals(query.CountryCode, ordinalIgnoreCase));
            //}
            if (query.CountryCode == null)
            {
                view = view.Where(x => (x.Participants.Any((y => string.IsNullOrWhiteSpace(y.CountryCode)))));
            }
            //when the country code is specified, match establishments with country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                view = view.Where(x => (x.Participants.Any(y => y.CountryCode.Equals(query.CountryCode, ordinalIgnoreCase))));
            }
//            orderBy.Add(e => (e.Participants.Any(x => !x.IsOwner && x.CountryName != null) ? e.Participants.FirstOrDefault(x => !x.IsOwner).CountryName : null), OrderByDirection.Descending);


            //search names & URL's for keyword
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                view = view.Where(x =>  x.Name != null && x.Name.Contains(query.Keyword, ordinalIgnoreCase)
                    
                );
            }

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