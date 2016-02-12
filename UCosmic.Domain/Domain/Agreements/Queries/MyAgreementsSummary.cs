using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementsSummary : IDefineQuery<AgreementsSummary>
    {
        public MyAgreementsSummary(IPrincipal principal, string domain, string countryCode, string typeCode, string keyword, string continentCode)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Domain = domain;
            CountryCode = countryCode;
            TypeCode = typeCode;
            Keyword = keyword;
            ContinentCode = continentCode;
        }

        public MyAgreementsSummary(IPrincipal principal, int establishmentId)
            : this(principal, null, null, null, null, null)
        {
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public string Domain { get; private set; }
        public string CountryCode { get; private set; }
        public string ContinentCode { get; private set; }
        public string TypeCode { get; private set; }
        public string Keyword { get; set; }
        public int? EstablishmentId { get; private set; }
    }

    public class AgreementsSummary
    {
        public int AgreementCount { get; internal set; }
        public int PartnerCount { get; internal set; }
        public int CountryCount { get; internal set; }
    }

    public class HandleMyAgreementsSummaryQuery : IHandleQueries<MyAgreementsSummary, AgreementsSummary>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleMyAgreementsSummaryQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public AgreementsSummary Handle(MyAgreementsSummary query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var queryable = _entities.Query<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[]
                {
                })
                .VisibleTo(query.Principal, _queryProcessor)
            ;
            //queryable = queryable.Where(x => x.Status != "inactive");

            if (!query.EstablishmentId.HasValue)
                queryable = queryable.ByOwnerDomain(query.Domain);
            else
                queryable = queryable.Where(x => x.Participants.Any(y => y.IsOwner &&
                    (y.EstablishmentId == query.EstablishmentId.Value || y.Establishment.Ancestors.Any(z => z.AncestorId == query.EstablishmentId.Value))));


            if (query.TypeCode != null && query.TypeCode != "any" && query.TypeCode != "")
            {
                queryable = queryable.Where(x => x.Type == query.TypeCode);
            }

            if (!string.IsNullOrWhiteSpace(query.CountryCode) && query.CountryCode != "any")
            {
                queryable = queryable.Where(x => x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsCountry && z.GeoPlanetPlace != null && query.CountryCode.Equals(z.GeoPlanetPlace.Country.Code, StringComparison.OrdinalIgnoreCase))));
            }

            if (!string.IsNullOrWhiteSpace(query.ContinentCode) && query.ContinentCode != "any")
            {
                queryable = queryable.Where(x => x.Participants.Any(y => !y.IsOwner && y.Establishment.Location.Places.Any(z => z.IsContinent && z.GeoNamesToponym != null && query.ContinentCode.Equals(z.GeoNamesToponym.ContinentCode, StringComparison.OrdinalIgnoreCase))));
            }

            if (!string.IsNullOrWhiteSpace(query.Keyword) && query.Keyword != "!none!")
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


            queryable = queryable.VisibleTo(query.Principal, _queryProcessor);

            var agreementCount = queryable
                .Select(x => x.Id)
                .Distinct().Count();
            var partnerCount = queryable
                .SelectMany(x => x.Participants.Where(y => !y.IsOwner))
                .Select(x => x.EstablishmentId)
                .Distinct().Count();
            var countryCount = queryable
                .SelectMany(x => x.Participants.Where(y => !y.IsOwner))
                .SelectMany(x => x.Establishment.Location.Places.Where(y => y.IsCountry))
                .Select(x => x.RevisionId)
                .Distinct().Count();

            return new AgreementsSummary
            {
                AgreementCount = agreementCount,
                PartnerCount = partnerCount,
                CountryCount = countryCount,
            };
        }
    }
}