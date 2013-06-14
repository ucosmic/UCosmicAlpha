using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class DetachFileFromAgreement
    {
        public DetachFileFromAgreement(IPrincipal principal, Guid fileGuid, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (fileGuid == Guid.Empty) throw new ArgumentException("Cannot be empty", "fileGuid");
            FileGuid = fileGuid;

            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be empty");
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public Guid FileGuid { get; private set; }
        public int AgreementId { get; private set; }
        public bool IsNewlyDetached { get; internal set; }
    }

    public class HandleDetachFileFromAgreementCommand : IHandleCommands<DetachFileFromAgreement>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandleDetachFileFromAgreementCommand(ICommandEntities entities
            , IStoreBinaryData binaryData
        )
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(DetachFileFromAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // todo: this should be FindByPrimaryKey
            var entity = _entities.Get<InstitutionalAgreementFile>()
                .SingleOrDefault(x =>
                    x.EntityId == command.FileGuid &&
                    x.Agreement.Id == command.AgreementId
                );

            if (entity == null) return;

            if (!string.IsNullOrWhiteSpace(entity.Path))
                _binaryData.Delete(entity.Path);

            _entities.Purge(entity);
            command.IsNewlyDetached = true;
        }
    }
}
