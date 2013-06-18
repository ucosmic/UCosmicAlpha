using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class RemoveParticipantFromAgreement
    {
        public RemoveParticipantFromAgreement(IPrincipal principal, int establishmentId, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (establishmentId == 0) throw new ArgumentOutOfRangeException("establishmentId", "Cannot be empty");
            EstablishmentId = establishmentId;

            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be empty");
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int EstablishmentId { get; private set; }
        public int AgreementId { get; private set; }
        public bool IsNewlyRemoved { get; internal set; }
    }

    public class HandleRemoveParticipantFromAgreementCommand : IHandleCommands<RemoveParticipantFromAgreement>
    {
        private readonly ICommandEntities _entities;

        public HandleRemoveParticipantFromAgreementCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(RemoveParticipantFromAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // todo: this should be FindByPrimaryKey
            var entity = _entities.Get<AgreementParticipant>()
                .SingleOrDefault(x =>
                    x.Establishment.RevisionId == command.EstablishmentId &&
                    x.Agreement.Id == command.AgreementId
                );

            if (entity == null) return;
            _entities.Purge(entity);
            command.IsNewlyRemoved = true;
        }
    }
}
