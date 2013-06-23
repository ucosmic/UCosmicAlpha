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

        internal AddParticipantToAgreement(IPrincipal principal, int establishmentId, Agreement agreement)
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
        internal Agreement Agreement { get; set; }
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
                _entities.Get<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[]
                {
                    r => r.Participants,
                })
                .ById(command.AgreementId);
            if (agreement == null)
                throw new InvalidOperationException(string.Format("Agreement with id '{0}' could not be found.", command.AgreementId));

            var participant = agreement.Participants.SingleOrDefault(
                x => x.Establishment.RevisionId == command.EstablishmentId);
            if (participant != null) return;

            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Ancestors.Select(y => y.Ancestor)
                })
                .SingleOrDefault(x => x.RevisionId == command.EstablishmentId);
            if (establishment == null)
                throw new InvalidOperationException(string.Format("Establishment with id '{0}' could not be found.", command.EstablishmentId));


            participant = new AgreementParticipant
            {
                Establishment = establishment,
                Agreement = agreement,
            };

            // derive ownership (todo, this should be a separate query)
            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations,
                })
                .SingleOrDefault(x => x.User != null && command.Principal.Identity.Name.Equals(x.User.Name, StringComparison.OrdinalIgnoreCase));

            if (person != null)
            {
                var establishmentIds = establishment.Ancestors.Select(y => y.AncestorId).ToList();
                establishmentIds.Insert(0, establishment.RevisionId);

                if (person.DefaultAffiliation != null &&
                    establishmentIds.Contains(person.DefaultAffiliation.EstablishmentId))
                    participant.IsOwner = true;
            }

            _entities.Create(participant);
            command.IsNewlyAdded = true;
        }
    }
}
