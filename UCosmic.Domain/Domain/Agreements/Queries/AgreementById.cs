using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class AgreementById : BaseEntityQuery<InstitutionalAgreement>, IDefineQuery<InstitutionalAgreement>
    {
        public AgreementById(IPrincipal principal, int id)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
    }

    public class HandleAgreementByIdQuery : IHandleQueries<AgreementById, InstitutionalAgreement>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleAgreementByIdQuery(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public InstitutionalAgreement Handle(AgreementById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var agreement = _entities.Query<InstitutionalAgreement>()
                .EagerLoad(_entities, query.EagerLoad)
                .ById(query.Id);
            if (agreement == null) return null;

            // make sure user is authorized to view this data
            var user = _queryProcessor.Execute(new UserByName(query.Principal.Identity.Name)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations.Select(y => y.Establishment.Offspring.Select(z => z.Offspring)),
                }
            });

            var userVisibility = InstitutionalAgreementVisibility.Public;
            if (user != null)
            {
                var defaultAffiliation = user.Person.DefaultAffiliation;
                var owningParticipantIds = agreement.Participants.Where(x => x.IsOwner).Select(x => x.Establishment.RevisionId);
                var ownedEstablishmentIds = defaultAffiliation.Establishment.Offspring.Select(x => x.OffspringId).ToList();
                ownedEstablishmentIds.Insert(0, defaultAffiliation.Establishment.RevisionId);

                // user has protected visibility when default affiliation is with
                // an owning participant or one of its ancestors
                if (ownedEstablishmentIds.Any(owningParticipantIds.Contains))
                    userVisibility = InstitutionalAgreementVisibility.Protected;

                if (userVisibility == InstitutionalAgreementVisibility.Protected &&
                    query.Principal.IsInAnyRole(RoleName.InstitutionalAgreementManagers))
                    userVisibility = InstitutionalAgreementVisibility.Private;
            }

            const string privateData = "[Private Data]";
            switch (userVisibility)
            {
                case InstitutionalAgreementVisibility.Public:
                    // when user is public and agreement is not public, hide it 
                    if (agreement.Visibility != InstitutionalAgreementVisibility.Public) return null;

                    // when user is public and agreement is public, obfuscate protected & private data
                    agreement.Notes = privateData;
                    agreement.IsAutoRenew = null;
                    agreement.ExpiresOn = DateTime.MinValue;
                    agreement.IsExpirationEstimated = false;
                    agreement.Status = privateData;
                    agreement.Contacts = agreement.Contacts != null ? null : agreement.Contacts;
                    agreement.Files = agreement.Files != null ? null : agreement.Files;
                    break;

                case InstitutionalAgreementVisibility.Protected:
                    // when user is protected and agreement is private, hide it
                    if (agreement.Visibility == InstitutionalAgreementVisibility.Private) return null;

                    // when user is protected and agreement is not private, hide private data
                    agreement.Status = privateData;
                    break;
            }

            return agreement;
        }
    }
}
