using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Agreements
{
    public class PurgeInstitutionalAgreement
    {
        public PurgeInstitutionalAgreement(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (agreementId == 0) throw new ArgumentOutOfRangeException("agreementId", "Cannot be zero");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class HandlePurgeInstitutionalAgreementCommand : IHandleCommands<PurgeInstitutionalAgreement>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandlePurgeInstitutionalAgreementCommand(IProcessQueries queryProcessor
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

        public void Handle(PurgeInstitutionalAgreement command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // find agreement
            var agreement = _queryProcessor.Execute(
                new AgreementById(command.Principal, command.AgreementId));
            if (agreement == null) return;

            agreement = _entities.Get<InstitutionalAgreement>().ById(command.AgreementId);

            if (agreement.Files != null && agreement.Files.Any())
            {
                foreach (var file in agreement.Files.Where(x => !string.IsNullOrWhiteSpace(x.Path)))
                {
                    _binaryData.Delete(file.Path);
                }
            }

            _entities.Purge(agreement);
            _unitOfWork.SaveChanges();
        }
    }
}
