using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class AgreementsByKeyword : BaseEntitiesQuery<Agreement>, IDefineQuery<PagedQueryResult<Agreement>>
    {
        public AgreementsByKeyword(IPrincipal principal, string ownerDomain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            OwnerDomain = ownerDomain;
            PageSize = 10;
            PageNumber = 1;
        }

        public IPrincipal Principal { get; private set; }
        public string OwnerDomain { get; private set; }

        public int PageSize { get; set; }
        public int PageNumber { get; set; }

        public string CountryCode { get; set; }
        public string Keyword { get; set; }
    }

    public class HandleAgreementsByKeywordQuery : IHandleQueries<AgreementsByKeyword, PagedQueryResult<Agreement>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleAgreementsByKeywordQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public PagedQueryResult<Agreement> Handle(AgreementsByKeyword query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Agreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByOwnerDomain(query.OwnerDomain)
                .VisibleTo(query.Principal, _queryProcessor)
            ;

            //// when the query's country code is empty string, match all agreements regardless of country.
            //// when the query's country code is null, match agreements with partners that have no known country
            if (query.CountryCode == null)
            {
                queryable = queryable.Where(x => !x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry)));
            }
            //when the country code is specified, match agreements with partners located in the country
            else if (!string.IsNullOrWhiteSpace(query.CountryCode))
            {
                //view = view.Where(x => x.Participants.Any(p => query.CountryCode.Equals(p.CountryCode, ordinalIgnoreCase)));
                queryable = queryable.Where(x => x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry && z.GeoPlanetPlace != null && query.CountryCode.Equals(z.GeoPlanetPlace.Country.Code, StringComparison.OrdinalIgnoreCase))));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                queryable = queryable.Where(x => (x.Name != null && x.Name.Contains(query.Keyword))
                    || x.Participants.Any(y => y.Establishment.Location.Places.Any(z => 
                        z.IsCountry && z.OfficialName.Contains(query.Keyword)))
                    || x.Participants.Any(y => y.Establishment.Names.Any(z => z.Text.Contains(query.Keyword)
                        || (z.AsciiEquivalent != null && z.AsciiEquivalent.Contains(query.Keyword))))
                    || x.Participants.Any(y => y.Establishment.Names.Any(z => z.Text.Contains(query.Keyword)
                        || (z.AsciiEquivalent != null && z.AsciiEquivalent.Contains(query.Keyword))))
                    || x.Participants.Any(y => y.Establishment.Urls.Any(z => z.Value.Contains(query.Keyword)))
                    || x.Type.Contains(query.Keyword)
                );
            }

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Agreement>(queryable, query.PageSize, query.PageNumber);
            pagedResults.Items.ApplySecurity(query.Principal, _queryProcessor);

            return pagedResults;
        }
    }
}
