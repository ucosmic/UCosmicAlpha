using System;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentByDomain : BaseEntityQuery<Establishment>, IDefineQuery<Establishment>
    {
        public EstablishmentByDomain(string domain)
        {
            Domain = domain;
        }

        public string Domain { get; private set; }

        internal string WebsiteUrl
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Domain)) return Domain;
                return !Domain.StartsWith("www.", StringComparison.OrdinalIgnoreCase)
                    ? string.Format("www.{0}", Domain) : Domain;
            }
        }
    }

    public class HandleEstablishmentByDomainQuery : IHandleQueries<EstablishmentByDomain, Establishment>
    {
        private readonly IQueryEntities _entities;

        public HandleEstablishmentByDomainQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Establishment Handle(EstablishmentByDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Establishment>()
                .EagerLoad(_entities, query.EagerLoad)
                .ByUrl(query.WebsiteUrl)
            ;
        }
    }
}
