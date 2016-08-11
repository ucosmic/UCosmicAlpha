using System;
using System.Linq;
using MoreLinq;
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
        public string TypeCode { get; set; }
        public string Keyword { get; set; }
        public int AncestorId { get; set; }
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
            //queryable = queryable.Where(x => x.Status != "inactive");
            

            if (query.TypeCode != null && query.TypeCode != "any" && query.TypeCode != "")
            {
                queryable = queryable.Where(x => x.Type == query.TypeCode);
            }

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

            if (query.AncestorId != 0)
            {
                queryable = queryable.Where(x => x.Participants.Any(y => y.EstablishmentId == query.AncestorId) || x.Participants.Any(y => y.Establishment.Ancestors.Any(z => z.AncestorId == query.AncestorId)));
            }


            //case "sub-affiliation":
            //queryable = queryable.OrderBy(x => x.Participants.Where(y => y.IsOwner).MaxBy(y => y.Establishment.Ancestors != null ? y.Establishment.Ancestors.MaxBy(z => z.Separation).Separation : 0).Establishment.OfficialName);
                //? x.Participants.Where(y => y.IsOwner && y.Establishment.Ancestors. y.Establishment.Ancestors.MaxBy(z => z.Separation)).Establishment.OfficialName
                //: x.Participants.FirstOrDefault(y => y.IsOwner).Establishment.OfficialName);
            //int max = items.Max(i => i.ID);
            //var item = items.First(x => x.ID == max);

            //queryable = queryable.Aggregate((i1,i2) => i1.ID > i2.ID ? i1 : i2)

            //var item = queryable.First(x => x.Participants.Where(y => y.IsOwner).Max(y => y.Establishment.Ancestors != null ? y.Establishment.Ancestors.MaxBy(z => z.Separation).Separation : 0) == max);
            //queryable = queryable.OrderBy(x => x.Participants.Where(y => y.IsOwner).MaxBy(y => y.Establishment.Ancestors != null ? y.Establishment.Ancestors.MaxBy(z => z.Separation).Separation : 0).Establishment.OfficialName);


            //*********************** this seems to be working but need to test further. Also need to add back in the orderby below
            // also need to do an if statement if this order by is used
            // also add in the stuff in the view and viewmodel
            //int max = queryable.Max(x => x.Participants.Where(y => y.IsOwner).Max(y => y.Establishment.Ancestors.Any() != null ? y.Establishment.Ancestors.Max(z => z.Separation) : 0));
            //queryable = queryable.OrderByDescending(x => x.Participants.Where(y => y.IsOwner).FirstOrDefault(y => y.Establishment.Ancestors.Any() != null ? y.Establishment.Ancestors.Max(z => z.Separation) == max : 0 == max).Establishment.OfficialName);

            queryable = queryable.OrderBy(query.OrderBy);

            var pagedResults = new PagedQueryResult<Agreement>(queryable, query.PageSize, query.PageNumber);
            pagedResults.Items.ApplySecurity(query.Principal, _queryProcessor);

            return pagedResults;
        }
    }
}
