using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class PurgeAgreement
    {
        public PurgeAgreement(IPrincipal principal, int agreementId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
    }

    public class ValidatePurgeAgreementCommand : AbstractValidator<PurgeAgreement>
    {
        public ValidatePurgeAgreementCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
            ;

            RuleFor(x => x.AgreementId)
                // agreement id must exist
                .MustFindAgreementById(queryProcessor, x => x.Principal)
                    .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)

                // agreement cannot be umbrella for any other agreements
                .MustNotHaveOffspring(queryProcessor, x => x.Principal)
            ;
        }
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
            var filePaths = entity.Files.Where(x => !string.IsNullOrEmpty(x.Path))
                .Select(x => x.Path).ToArray();

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

            if (!filePaths.Any()) return;
            foreach (var filePath in filePaths) _binaryData.Delete(filePath);
        }
    }
}
