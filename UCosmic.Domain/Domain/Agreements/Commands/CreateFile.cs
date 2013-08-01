using System;
using System.IO;
using System.Linq;
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
        public string CustomName { get; set; }
        public Guid? UploadGuid { get; set; }
        public FileDataWrapper FileData { get; set; }
        public class FileDataWrapper
        {
            public byte[] Content { get; set; }
            public string MimeType { get; set; }
            public string FileName { get; set; }
        }
        public int CreatedFileId { get; internal set; }
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
                .NotEmpty()
                    .WithMessage(MustHaveAgreementVisibility.FailMessage)
                .MustHaveAgreementVisibility()
                    .WithMessage(MustHaveAgreementVisibility.FileFailMessage)
            ;

            // when uploadid is present
            When(x => x.UploadGuid.HasValue, () =>
            {
                // there must be no raw file data
                RuleFor(x => x.FileData)
                    .Must(x => x == null)
                        .WithMessage("FileData must be null when an UploadGuid value is provided.");

                RuleFor(x => x.UploadGuid.Value)
                    // upload id must exist
                    .MustFindUploadByGuid(entities)
                        .WithMessage(MustFindUploadByGuid.FailMessageFormat, x => x.UploadGuid)

                    // uploaded file must have been created by same user who us creating this file
                    .MustBeUploadedByPrincipal(entities, x => x.Principal)

                    // file name must be within length requirements
                    .MustNotExceedFileNameLength(AgreementFileConstraints.FileNameMaxLength, entities)
                        .WithMessage(MustNotExceedFileNameLength.FailMessageFormat,
                            x => AgreementFileConstraints.FileNameMaxLength)

                    // uploaded file must have valid extension
                    .MustHaveAllowedFileExtension(entities, AgreementFileConstraints.AllowedFileExtensions)

                    // uploaded file not be too large
                    .MustNotExceedFileSize(25, FileSizeUnitName.Megabyte, entities)
                ;
            });

            // when file data is not null
            When(x => x.FileData != null, () =>
            {
                // there must be no upload id
                RuleFor(x => x.UploadGuid)
                    .Must(x => !x.HasValue)
                        .WithMessage("UploadGuid must be null when FileData is provided.");

                RuleFor(x => x.FileData.MimeType)
                    // file must have mime type
                    .NotEmpty().WithMessage(MustHaveFileMimeType.FailMessage)
                ;

                RuleFor(x => x.FileData.FileName)
                    // file name must be present
                    .NotEmpty().WithMessage(MustHaveFileName.FailMessage)

                    // file name must be within length requirements
                    .Length(1, AgreementFileConstraints.FileNameMaxLength)
                        .WithMessage(MustNotExceedFileNameLength.FailMessageFormat,
                            x => AgreementFileConstraints.FileNameMaxLength)

                    // file name must have valid extension
                    .MustHaveAllowedFileExtension(AgreementFileConstraints.AllowedFileExtensions)
                ;

                RuleFor(x => x.FileData.Content)
                    // content cannot be null or zero length
                    .NotNull().WithMessage(MustHaveFileContent.FailMessage)
                    .Must(x => x.Length > 0).WithMessage(MustHaveFileContent.FailMessage)

                    // uploaded file not be too large
                    .MustNotExceedFileSize(25, FileSizeUnitName.Megabyte, x => x.FileData.FileName)
                ;
            });

            // when custom name is provided
            When(x => !string.IsNullOrWhiteSpace(x.CustomName), () =>
                RuleFor(x => x.CustomName)
                    .Length(1, AgreementFileConstraints.NameMaxLength)
                        .WithMessage(MustNotExceedFileNameLength.FailMessageFormat, x => AgreementFileConstraints.NameMaxLength)
            );

            // when neither upload id or file data is present
            const string noFileContentMessage = "Both UploadGuid and FileData are null. Exactly one of these must be provided for this command.";
            When(x => !x.UploadGuid.HasValue && x.FileData == null, () =>
            {
                RuleFor(x => x.FileData).Must(x => false).WithMessage(noFileContentMessage);
                RuleFor(x => x.UploadGuid).Must(x => false).WithMessage(noFileContentMessage);
            });
        }
    }

    public class HandleCreateFileCommand : IHandleCommands<CreateFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryData;
        private readonly IHandleCommands<PurgeUpload> _purgeUpload;

        public HandleCreateFileCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryData
            , IHandleCommands<PurgeUpload> purgeUpload
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _binaryData = binaryData;
            _purgeUpload = purgeUpload;
        }

        public void Handle(CreateFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // create the initial entity
            var entity = new AgreementFile
            {
                AgreementId = command.AgreementId,
                Visibility = command.Visibility.AsEnum<AgreementVisibility>(),
                Path = string.Format(AgreementFile.PathFormat, command.AgreementId, Guid.NewGuid()),
            };
            _entities.Create(entity);

            // will we be moving an upload or creating a new file from scratch?
            var upload = command.UploadGuid.HasValue
                ? _entities.Get<Upload>().Single(x => x.Guid.Equals(command.UploadGuid.Value)) : null;

            // populate other entity properties and store binary data
            if (upload != null)
            {
                entity.FileName = upload.FileName;
                entity.Length = (int)upload.Length;
                entity.MimeType = upload.MimeType;
                entity.Name = GetExtensionedCustomName(command.CustomName, upload.FileName);
                _binaryData.Move(upload.Path, entity.Path);
                _purgeUpload.Handle(new PurgeUpload(upload.Guid) { NoCommit = true });
            }
            else
            {
                entity.FileName = command.FileData.FileName;
                entity.Length = command.FileData.Content.Length;
                entity.MimeType = command.FileData.MimeType;
                entity.Name = GetExtensionedCustomName(command.CustomName, command.FileData.FileName);
                _binaryData.Put(entity.Path, command.FileData.Content);
            }

            try
            {
                _unitOfWork.SaveChanges();
                command.CreatedFileId = entity.Id;
            }
            // ReSharper disable EmptyGeneralCatchClause
            catch
            {
                // restore binary data state when the db save fails
                if (_binaryData.Exists(entity.Path))
                    if (upload != null) _binaryData.Move(entity.Path, upload.Path);
                    else _binaryData.Delete(entity.Path);
            }
            // ReSharper restore EmptyGeneralCatchClause
        }

        private static string GetExtensionedCustomName(string customName, string originalName)
        {
            var extension = Path.GetExtension(originalName);
            if (string.IsNullOrWhiteSpace(extension)) throw new InvalidOperationException(string.Format(
                "The file name '{0}' does not have an extension.", originalName));
            if (customName.EndsWith(extension, StringComparison.OrdinalIgnoreCase)) return customName;
            return string.Format("{0}{1}", customName, extension);
        }
    }
}
