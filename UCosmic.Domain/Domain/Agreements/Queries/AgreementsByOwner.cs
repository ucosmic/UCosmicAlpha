using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class AgreementsByOwnerDomain : BaseEntitiesQuery<Agreement>, IDefineQuery<Agreement[]>
    {
        public AgreementsByOwnerDomain(IPrincipal principal, string ownerDomain)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            OwnerDomain = ownerDomain;
        }

        public IPrincipal Principal { get; private set; }
        public string OwnerDomain { get; private set; }

        internal string WwwOwnerDomain
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_wwwOwnerDomain))
                {
                    _wwwOwnerDomain = OwnerDomain;
                    if (_wwwOwnerDomain != null && !_wwwOwnerDomain.Equals("default", StringComparison.OrdinalIgnoreCase)
                        && !_wwwOwnerDomain.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
                        _wwwOwnerDomain = string.Format("www.{0}", _wwwOwnerDomain);
                }
                return _wwwOwnerDomain;
            }
        }
        private string _wwwOwnerDomain;
    }

    public class HandleAgreementsByOwnerDomainQuery : IHandleQueries<AgreementsByOwnerDomain, Agreement[]>
    {
        private readonly IQueryEntities _entities;

        public HandleAgreementsByOwnerDomainQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Agreement[] Handle(AgreementsByOwnerDomain query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreements = _entities.Query<Agreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .Where(x => x.Participants.Any(y => y.IsOwner
                    && (
                        (y.Establishment.WebsiteUrl != null && y.Establishment.WebsiteUrl.Equals(query.WwwOwnerDomain, StringComparison.OrdinalIgnoreCase))
                        ||
                        (y.Establishment.Ancestors.Any(z => z.Ancestor.WebsiteUrl != null && z.Ancestor.WebsiteUrl.Equals(query.WwwOwnerDomain)))
                    )
                ))
                //.Where(x => x.Participants.Any(y => y.IsOwner && y.EstablishmentId == 66))
                .OrderBy(query.OrderBy)
            ;

            return agreements.ToArray();
        }
    }
}
