using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class PurgeFile
    {
        public PurgeFile(IPrincipal principal, int agreementId, int fileId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            AgreementId = agreementId;
            FileId = fileId;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; private set; }
        public int FileId { get; private set; }
    }

    public class ValidatePurgeFileCommand : AbstractValidator<PurgeFile>
    {
        public ValidatePurgeFileCommand(IQueryEntities entities, IProcessQueries queryProcessor)
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
                .MustFindAgreementById(entities)
                    .WithMessage(MustFindAgreementById<object>.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)

                // file id must exist under this agreement
                .MustOwnFileWithId(entities, x => x.FileId)
                    .WithMessage(MustOwnFileWithId<object>.FailMessageFormat, x => x.AgreementId, x => x.FileId)
            ;
        }
    }

    public class HandlePurgeFileCommand : IHandleCommands<PurgeFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryData;

        public HandlePurgeFileCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryData
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _binaryData = binaryData;
        }

        public void Handle(PurgeFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<AgreementFile>().Single(x => x.Id == command.FileId);
            var path = entity.Path;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.AgreementId,
                    command.FileId,
                }),
                PreviousState = entity.ToJsonAudit(),
            };

            _entities.Create(audit);
            _entities.Purge(entity);
            _unitOfWork.SaveChanges();
            _binaryData.Delete(path);
        }
    }
}
