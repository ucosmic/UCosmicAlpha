using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateFile
    {
        public CreateFile(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int AgreementId { get; set; }
        public string Visibility { get; set; }
        public Guid? UploadGuid { get; set; }
        public FileDataWrapper FileData { get; set; }
        public class FileDataWrapper
        {
            public byte[] Content { get; set; }
            public string MimeType { get; set; }
            public string FileName { get; set; }
        }
    }

    public class ValidateCreateFileCommand : AbstractValidator<CreateFile>
    {
        public ValidateCreateFileCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal must be authorized to perform this action
            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustBeInAnyRole(RoleName.AgreementManagers)
                    .WithMessage(MustBeInAnyRole.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name)
            ;

            RuleFor(x => x.AgreementId)
                // agreement id must exist
                .MustFindAgreementById(entities)
                    .WithMessage(MustFindAgreementById.FailMessageFormat, x => x.AgreementId)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.AgreementId, x => x.Principal.Identity.Name)
            ;

            // visibility is required
            RuleFor(x => x.Visibility)
                .MustHaveAgreementVisibility()
                    .WithMessage(MustHaveAgreementVisibility.FileFailMessage)
            ;

            // when uploadid is present
            RuleFor(x => x.UploadGuid)
                // upload id must exist when provided
                .MustFindUploadByGuid(entities)
                .When(x => x.UploadGuid.HasValue, ApplyConditionTo.CurrentValidator)
                    .WithMessage(MustFindUploadByGuid.FailMessageFormat, x => x.UploadGuid)

                // uploaded file must have been created by same user who us creating this file
                .MustBeUploadedByPrincipal(entities, x => x.Principal)
                .When(x => x.UploadGuid.HasValue, ApplyConditionTo.CurrentValidator)

                // uploaded file must have valid extension
                .MustHaveAllowedFileExtension(entities, AgreementFileConstraints.AllowedFileExtensions)
                .When(x => x.UploadGuid.HasValue, ApplyConditionTo.CurrentValidator)

                // uploaded file not be too large
                .MustNotExceedFileSize(25, FileSizeUnitName.Megabyte, entities)
                .When(x => x.UploadGuid.HasValue, ApplyConditionTo.CurrentValidator)
            ;
        }
    }

    public class HandleCreateFileCommand : IHandleCommands<CreateFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryData;

        public HandleCreateFileCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryData
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _binaryData = binaryData;
        }

        public void Handle(CreateFile command)
        {
            
        }
    }
}
