using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class AttachFileToAgreement
    {
        public AttachFileToAgreement(IPrincipal principal, int fileId, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (fileId == 0) throw new ArgumentOutOfRangeException("fileId", "Cannot be zero");
            FileId = fileId;

            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be zero");
            AgreementId = agreementId;
        }

        internal AttachFileToAgreement(IPrincipal principal, int fileId, InstitutionalAgreement agreement)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;

            if (fileId == 0) throw new ArgumentOutOfRangeException("fileId", "Cannot be zero");
            FileId = fileId;

            if (agreement == null) throw new ArgumentNullException("agreement");
            Agreement = agreement;
        }

        public IPrincipal Principal { get; private set; }
        public int FileId { get; private set; }
        public int AgreementId { get; private set; }
        internal InstitutionalAgreement Agreement { get; set; }
        public bool IsNewlyAttached { get; internal set; }
    }

    public class HandleAttachFileToAgreementCommand : IHandleCommands<AttachFileToAgreement>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandleAttachFileToAgreementCommand(ICommandEntities entities, IStoreBinaryData binaryData)
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(AttachFileToAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var agreement = command.Agreement ??
                _entities.Get<InstitutionalAgreement>()
                .EagerLoad(_entities, new Expression<Func<InstitutionalAgreement, object>>[]
                {
                    r => r.Files,
                })
                .ById(command.AgreementId);
            if (agreement == null)
                throw new InvalidOperationException(string.Format("Institutional Agreement with id '{0}' could not be found.", command.AgreementId));

            var file = agreement.Files.SingleOrDefault(g => g.Id == command.FileId);
            if (file != null) return;

            var looseFile = _entities.Get<LooseFile>().SingleOrDefault(x => x.RevisionId == command.FileId);
            if (looseFile == null) return;

            // also store in binary data
            var path = string.Format(InstitutionalAgreementFile.PathFormat, agreement.Id, Guid.NewGuid());
            _binaryData.Put(path, looseFile.Content);

            file = new InstitutionalAgreementFile
            {
                Agreement = agreement,
                //Content = looseFile.Content,
                Length = looseFile.Length,
                MimeType = looseFile.MimeType,
                Name = looseFile.Name,
                Path = path,
            };

            _entities.Create(file);
            _entities.Purge(looseFile);
            command.IsNewlyAttached = true;
        }
    }
}
