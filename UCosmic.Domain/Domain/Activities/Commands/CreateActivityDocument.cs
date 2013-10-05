using System;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using FluentValidation;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityDocument
    {
        public CreateActivityDocument(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        internal CreateActivityDocument(IPrincipal principal, ActivityValues activityValues)
            : this(principal, 0)
        {
            ActivityValues = activityValues;
            Mode = activityValues.Mode;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
        public string Title { get; set; }
        public byte[] Content { get; set; }
        public string MimeType { get; set; }
        public string FileName { get; set; }
        internal bool NoCommit { get; set; }
        internal int? Length { get; set; }
        internal string Path { get; set; }
        internal Guid? EntityId { get; set; }
        internal ActivityValues ActivityValues { get; private set; }
        public IPrincipal Impersonator { get; set; }
        public ActivityDocument CreatedActivityDocument { get; internal set; }
    }

    public class ValidateCreateActivityDocumentCommand : AbstractValidator<CreateActivityDocument>
    {
        public ValidateCreateActivityDocumentCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            When(x => x.ActivityValues == null && x.ActivityId != 0, () =>
            {
                RuleFor(x => x.ActivityId)
                    .MustFindActivityById(queryProcessor)
                ;

                When(x => x.Mode.HasValue, () =>
                    // ReSharper disable PossibleInvalidOperationException
                    RuleFor(x => x.ActivityId)
                        .MustHaveValuesForMode(queryProcessor, x => x.Mode.Value)
                    // ReSharper restore PossibleInvalidOperationException
                );

                When(x => !x.Mode.HasValue, () =>
                    RuleFor(x => x.ActivityId)
                        .MustHaveValuesForMode(queryProcessor)
                );

                RuleFor(x => x.Principal)
                    .MustFindUserByPrincipal(queryProcessor)
                    .MustOwnActivity(queryProcessor, x => x.ActivityId)
                ;
            });

            When(x => x.ActivityValues != null, () =>
                RuleFor(x => x.Principal)
                    .MustFindUserByPrincipal(queryProcessor)
                    .MustOwnActivity(queryProcessor, x => x.ActivityValues.ActivityId)
            );

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

            // file size cannot exceed 4 megabytes
            RuleFor(x => x.Content)
                .MustNotExceedFileSize(ActivityDocumentConstraints.MaxFileMegaBytes, ActivityDocumentConstraints.MaxFileUnitName, x => x.FileName)
                .When(x => x.Content != null, ApplyConditionTo.CurrentValidator)
            ;
        }
    }

    public class HandleCreateActivityDocumentCommand : IHandleCommands<CreateActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _detachedEntities;
        private readonly IStoreBinaryData _binaryData;

        public HandleCreateActivityDocumentCommand(ICommandEntities entities
            , IQueryEntities detachedEntities
            , IStoreBinaryData binaryData
        )
        {
            _entities = entities;
            _detachedEntities = detachedEntities;
            _binaryData = binaryData;
        }

        public void Handle(CreateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var values = command.ActivityValues;
            if (values == null)
            {
                if (command.Mode.HasValue)
                {
                    var modeText = command.Mode.Value.AsSentenceFragment();
                    values = _entities.Get<ActivityValues>()
                        .Single(x => x.ActivityId == command.ActivityId && x.ModeText == modeText);
                }
                else
                {
                    values = _entities.Get<ActivityValues>()
                        .Single(x => x.ActivityId == command.ActivityId && x.ModeText == x.Activity.ModeText);
                }
            }

            var path = command.Path;
            if (string.IsNullOrWhiteSpace(path))
            {
                path = string.Format(ActivityDocument.PathFormat, values.ActivityId, Guid.NewGuid());
                _binaryData.Put(path, command.Content, true);
            }

            var activityDocument = new ActivityDocument
            {
                ActivityValues = values,
                Title = command.Title,
                FileName = command.FileName,
                MimeType = command.MimeType,
                Path = path,
                Length = command.Length.HasValue ? command.Length.Value : command.Content.Length,
                CreatedByPrincipal = command.Impersonator == null
                    ? command.Principal.Identity.Name
                    : command.Impersonator.Identity.Name,
            };
            if (command.EntityId.HasValue && command.EntityId != Guid.Empty)
                activityDocument.EntityId = command.EntityId.Value;
            values.Documents.Add(activityDocument);

            // do NOT update activity here as it throws concurrency exceptions
            // when users upload multiple documents at once

            _entities.Create(activityDocument);

            if (!command.NoCommit)
            {
                try
                {
                    _entities.SaveChanges();
                    command.CreatedActivityDocument = _detachedEntities.Query<ActivityDocument>()
                        .Single(x => x.RevisionId == activityDocument.RevisionId);
                }
                catch
                {
                    _binaryData.Delete(activityDocument.Path);
                    throw;
                }
            }
            else
            {
                command.CreatedActivityDocument = activityDocument;
            }
        }
    }
}

