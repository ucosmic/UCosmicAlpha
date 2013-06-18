using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class ParticipantByEstablishmentId : BaseEntityQuery<AgreementParticipant>, IDefineQuery<AgreementParticipant>
    {
        public ParticipantByEstablishmentId(IPrincipal principal, int establishmentId, int? agreementId = null)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            EstablishmentId = establishmentId;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
        public int? AgreementId { get; private set; }
    }

    public class HandleParticipantByEstablishmentIdQuery : IHandleQueries<ParticipantByEstablishmentId, AgreementParticipant>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleParticipantByEstablishmentIdQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public AgreementParticipant Handle(ParticipantByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            // return nothing for invalid establishments and users
            if (query.EstablishmentId == 0 || string.IsNullOrWhiteSpace(query.Principal.Identity.Name)) return null;

            var user = _queryProcessor.Execute(new UserByName(query.Principal.Identity.Name)
            {
                EagerLoad = new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations.Select(y => y.Establishment),
                }
            });
            if (user == null) return null;

            var establishment = _queryProcessor.Execute(new EstablishmentById(query.EstablishmentId)
            {
                EagerLoad = new Expression<Func<Establishment, object>>[]
                {
                    x => x.Ancestors.Select(y => y.Ancestor),
                },
            });
            if (establishment == null) return null;

            var agreement = query.AgreementId.HasValue ? _queryProcessor.Execute(new AgreementById(query.Principal, query.AgreementId.Value)) : null;

            var participant = new AgreementParticipant
            {
                Agreement = agreement,
                Establishment = establishment,
            };

            // participant is owner when principal is at or above the establishment in question
            if (user.Person.DefaultAffiliation.EstablishmentId == establishment.RevisionId)
            {
                participant.IsOwner = true;
            }
            else
            {
                var ancestor = establishment.Parent;
                while (ancestor != null && !participant.IsOwner)
                {
                    if (ancestor.RevisionId == user.Person.DefaultAffiliation.EstablishmentId)
                        participant.IsOwner = true;
                    ancestor = ancestor.Parent;
                }
            }

            return participant;
        }
    }
}
