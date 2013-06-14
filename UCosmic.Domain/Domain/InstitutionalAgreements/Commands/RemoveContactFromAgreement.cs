using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class RemoveContactFromAgreement
    {
        public RemoveContactFromAgreement(IPrincipal principal, int contactId, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (contactId == 0) throw new ArgumentOutOfRangeException("contactId", "Cannot be zero");
            ContactId = contactId;

            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be zero");
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int ContactId { get; private set; }
        public int AgreementId { get; private set; }
        public bool IsNewlyRemoved { get; internal set; }
    }

    public class HandleRemoveContactFromAgreementCommand : IHandleCommands<RemoveContactFromAgreement>
    {
        private readonly ICommandEntities _entities;

        public HandleRemoveContactFromAgreementCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(RemoveContactFromAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // todo: this should be FindByPrimaryKey
            var entity = _entities.Get<InstitutionalAgreementContact>()
                .SingleOrDefault(x => x.Id == command.ContactId);

            if (entity == null) return;
            _entities.Purge(entity);
            command.IsNewlyRemoved = true;
        }
    }
}
