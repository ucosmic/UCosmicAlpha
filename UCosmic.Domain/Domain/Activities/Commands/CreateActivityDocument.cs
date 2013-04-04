using System;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityDocument
    {
        public CreateActivityDocument()
        {
            Visible = true;
        }

        public Guid? EntityId { get; set; }
        public int ActivityValuesId { get; set; }
        public int? FileId { get; set; }
        public int? ImageId { get; set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public bool Visible { get; set; }

        public ActivityDocument CreatedActivityDocument { get; protected internal set; }
    }

    public class ValidateCreateActivityDocumentCommand : AbstractValidator<CreateActivityDocument>
    {
        public ValidateCreateActivityDocumentCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateActivityDocumentCommand : IHandleCommands<CreateActivityDocument>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateActivityDocumentCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            ActivityValues activityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("ActivityValues Id '{0}' was not found.", command.ActivityValuesId));
            }

            if (command.FileId.HasValue && (command.FileId.Value != 0))
            {
                LoadableFile loadableFile = _entities.Get<LoadableFile>().Single(x => x.Id == command.FileId.Value);
                if (loadableFile == null)
                {
                    // TODO: check this in command validator
                    throw new Exception(string.Format("LoadableFile Id '{0}' was not found.", command.FileId));
                }
            }

            if (command.ImageId.HasValue && (command.ImageId.Value != 0))
            {
                Image image = _entities.Get<Image>().Single(x => x.Id == command.ImageId.Value);
                if (image == null)
                {
                    // TODO: check this in command validator
                    throw new Exception(string.Format("Image Id '{0}' was not found.", command.ImageId));
                }
            }

            var activityDocument = new ActivityDocument
            {
                ActivityValuesId = activityValues.RevisionId,
                FileId = command.FileId,
                Mode = command.Mode,
                ImageId = command.ImageId,
                Title = command.Title,
                Visible = command.Visible
            };

            if (command.EntityId != null)
            {
                activityDocument.EntityId = command.EntityId.Value;
            }

            _entities.Create(activityDocument);
            _unitOfWork.SaveChanges();

            command.CreatedActivityDocument = activityDocument;
        }
    }
}

