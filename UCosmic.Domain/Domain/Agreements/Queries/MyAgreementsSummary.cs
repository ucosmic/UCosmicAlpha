using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class MyAgreementsSummary : IDefineQuery<AgreementsSummary>
    {
        public MyAgreementsSummary(IPrincipal principal, string domain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Domain = domain;
        }

        public MyAgreementsSummary(IPrincipal principal, int establishmentId)
            : this(principal, null)
        {
            EstablishmentId = establishmentId;
        }

        public IPrincipal Principal { get; private set; }
        public string Domain { get; private set; }
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

            if (!query.EstablishmentId.HasValue)
                queryable = queryable.ByOwnerDomain(query.Domain);
            else
                queryable = queryable.Where(x => x.Participants.Any(y => y.IsOwner &&
                    (y.EstablishmentId == query.EstablishmentId.Value || y.Establishment.Ancestors.Any(z => z.AncestorId == query.EstablishmentId.Value))));

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