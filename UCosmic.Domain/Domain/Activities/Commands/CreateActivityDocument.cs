using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityDocument
    {
        public CreateActivityDocument(IPrincipal principal)
        {
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityValuesId { get; set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public byte[] Content { get; set; }
        public string MimeType { get; set; }
        public string FileName { get; set; }
        internal bool NoCommit { get; set; }
        internal int? Length { get; set; }
        internal string Path { get; set; }

        public ActivityDocument CreatedActivityDocument { get; internal set; }
    }

    public class ValidateCreateActivityDocumentCommand : AbstractValidator<CreateActivityDocument>
    {
        public ValidateCreateActivityDocumentCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityValuesId)
                // activity id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityValues id", x => x.ActivityValuesId)

                // activity id must exist in the database
                .MustFindActivityValuesById(entities)
                    .WithMessage(MustFindActivityValuesById.FailMessageFormat, x => x.ActivityValuesId)
            ;

            var validFileExtensions = new[]
            {
                "png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff",      // images
                "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",     // documents
            };
            RuleFor(x => x.FileName)
                // file name is required
                .NotEmpty()
                    .WithMessage(MustHaveFileName.FailMessage)

                // only allow whitelisted extensions
                .MustHaveAllowedFileExtension(
                    validFileExtensions
                )
            ;

            // file size cannot exceed 25 megabytes
            RuleFor(x => x.Content)
                .MustNotExceedFileSizeInMegabytes(25, x => x.FileName)
                .When(x => x.Content != null, ApplyConditionTo.CurrentValidator)
            ;
        }
    }

    public class HandleCreateActivityDocumentCommand : IHandleCommands<CreateActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _detachedEntities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateActivityDocumentCommand(ICommandEntities entities
            , IQueryEntities detachedEntities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _detachedEntities = detachedEntities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityValues = _entities.Get<ActivityValues>()
                .Single(x => x.RevisionId == command.ActivityValuesId);

            var path = command.Path;
            if (string.IsNullOrWhiteSpace(path))
            {
                path = string.Format(ActivityDocument.PathFormat, activityValues.ActivityId, Guid.NewGuid());
                _binaryData.Put(path, command.Content);
            }

            var activityDocument = new ActivityDocument
            {
                ActivityValuesId = activityValues.RevisionId,
                Mode = command.Mode,
                Title = command.Title,
                FileName = command.FileName,
                MimeType = command.MimeType,
                Path = path,
                Length = command.Length.HasValue ? command.Length.Value : command.Content.Length,
                CreatedByPrincipal = command.Principal.Identity.Name,
            };

            _entities.Create(activityDocument);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
                command.CreatedActivityDocument = _detachedEntities.Query<ActivityDocument>()
                    .Single(x => x.RevisionId == activityDocument.RevisionId);
            }
            else
            {
                command.CreatedActivityDocument = activityDocument;
            }
        }
    }
}

