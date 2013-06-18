using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Agreements
{
    public class AddParticipantToAgreement
    {
        public AddParticipantToAgreement(IPrincipal principal, int establishmentId, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (establishmentId == 0) throw new ArgumentOutOfRangeException("establishmentId", "Cannot be zero");
            EstablishmentId = establishmentId;

            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be zero");
            AgreementId = agreementId;
        }

        internal AddParticipantToAgreement(IPrincipal principal, int establishmentId, InstitutionalAgreement agreement)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (establishmentId == 0) throw new ArgumentOutOfRangeException("establishmentId", "Cannot be zero");
            EstablishmentId = establishmentId;

            if (agreement == null) throw new ArgumentNullException("agreement");
            Agreement = agreement;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
        public int AgreementId { get; private set; }
        internal InstitutionalAgreement Agreement { get; set; }
        public bool IsNewlyAdded { get; internal set; }
    }

    public class HandleAddParticipantToAgreementCommand : IHandleCommands<AddParticipantToAgreement>
    {
        private readonly ICommandEntities _entities;

        public HandleAddParticipantToAgreementCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(AddParticipantToAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var agreement = command.Agreement ??
                _entities.Get<InstitutionalAgreement>()
                .EagerLoad(_entities, new Expression<Func<InstitutionalAgreement, object>>[]
                {
                    r => r.Participants,
                })
                .ById(command.AgreementId);
            if (agreement == null)
                throw new InvalidOperationException(string.Format("Institutional Agreement with id '{0}' could not be found.", command.AgreementId));

            var participant = agreement.Participants.SingleOrDefault(
                x => x.Establishment.RevisionId == command.EstablishmentId);
            if (participant != null) return;

            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    e => e.Affiliates.Select(a => a.Person.User),
                    e => e.Names.Select(n => n.TranslationToLanguage),
                    e => e.Ancestors.Select(h => h.Ancestor.Affiliates.Select(a => a.Person.User)),
                    e => e.Ancestors.Select(h => h.Ancestor.Names.Select(n => n.TranslationToLanguage))
                })
                .SingleOrDefault(x => x.RevisionId == command.EstablishmentId);
            if (establishment == null)
                throw new InvalidOperationException(string.Format("Establishment with id '{0}' could not be found.", command.EstablishmentId));


            participant = new InstitutionalAgreementParticipant
            {
                Establishment = establishment,
                Agreement = agreement,
            };

            // derive ownership (todo, this should be a separate query)
            Expression<Func<Affiliation, bool>> principalDefaultAffiliation = affiliation =>
                affiliation.IsDefault &&
                affiliation.Person.User != null &&
                affiliation.Person.User.Name.Equals(command.Principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
            participant.IsOwner = establishment.Affiliates.AsQueryable().Any(principalDefaultAffiliation) ||
                establishment.Ancestors.Any(n => n.Ancestor.Affiliates.AsQueryable().Any(principalDefaultAffiliation));

            _entities.Create(participant);
            command.IsNewlyAdded = true;
        }
    }
}
