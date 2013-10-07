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
        public string Domain { get; set; }
    }

    public class HandleAgreementViewsByKeywordQuery : IHandleQueries<AgreementViewsByKeyword, PagedQueryResult<AgreementView>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

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
            if (query.CountryCode == null)
            {
                view = view.Where(x => (x.Participants.Any((y => string.IsNullOrWhiteSpace(y.CountryCode)))));
            }
            //when the country code is specified, match establishments with country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                view = view.Where(x => x.Participants.Any(p => query.CountryCode.Equals(p.CountryCode, ordinalIgnoreCase)));
            }
            query.Domain = "www.uc.edu";

            //var domains = new List<string> { query.Domain.ToLower() };
            //if (!query.Domain.Equals("default", StringComparison.OrdinalIgnoreCase)
            //    && !query.Domain.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            //    domains.Add(string.Format("www.{0}", query.Domain));

            view = view.Where(x => x.Participants.Any(y => y.IsOwner
                    && (
                        (y.WebsiteUrl != null && query.Domain.Contains(y.WebsiteUrl))
                ||
                (y.Offspring.Any(z => query.Domain.Contains(z.WebsiteUrl)))
                    )
                ));
            //search names & URL's for keyword
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                view = view.Where(x =>  x.Name != null && x.Name.Contains(query.Keyword, ordinalIgnoreCase)
                    || x.Participants.Any(p => p.CountryName.Contains(query.Keyword, ordinalIgnoreCase) && p.IsOwner != true)
                    || x.Participants.Any(p => p.EstablishmentOfficialName.Contains(query.Keyword, ordinalIgnoreCase) && p.IsOwner != true)
                    || x.Participants.Any(p => p.EstablishmentTranslatedName.Contains(query.Keyword, ordinalIgnoreCase) && p.IsOwner != true)
                );
            }
            
            if (query.Id.HasValue)
                view = view.Where(x => x.Id == query.Id.Value);

            view = view.OrderBy(query.OrderBy);



            var pagedResults = new PagedQueryResult<AgreementView>(view, query.PageSize, query.PageNumber);

            return pagedResults;
        }
    }
}