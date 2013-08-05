using System;
using System.Linq;
using System.Security.Principal;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Agreements
{
    public class PurgeAgreement
    {
        public PurgeAgreement(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be zero");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class HandlePurgeAgreementCommand : IHandleCommands<PurgeAgreement>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeAgreementCommand(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(PurgeAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // find agreement
            var entity = _queryProcessor.Execute(
                new AgreementById(command.Principal, command.AgreementId));
            if (entity == null) return;

            entity = _entities.Get<Agreement>().ById(command.AgreementId);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new { command.AgreementId }),
                PreviousState = entity.ToJsonAudit(),
            };
            _entities.Create(audit);

            _entities.Purge(entity);
            _unitOfWork.SaveChanges();

            if (entity.Files == null || !entity.Files.Any()) return;
            foreach (var file in entity.Files.Where(x => !string.IsNullOrWhiteSpace(x.Path)))
                _binaryData.Delete(file.Path);
        }
    }
}
