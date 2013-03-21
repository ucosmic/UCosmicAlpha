using System;
using System.Drawing;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityDocument
    {
        public Guid? EntityId { get; set; }
        public int ActivityValuesId { get; set; }
        public int? FileId { get; set; }
        public int? ImageId { get; set; }
        public int? ProxyImageId { get; set; }
        public ActivityMode Mode { get; set; }

        public ActivityDocument CreatedActivityDocument { get; protected internal set; }
    }

    public class HandleCreateActivityDocumentCommand : IHandleCommands<CreateActivityDocument>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityDocumentCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityDocument command)
        {
            if (command == null) throw new ArgumentNullException("command");

            ActivityValues activityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null)
            {
                throw new Exception("ActivityValues Id " + command.ActivityValuesId.ToString() + " was not found.");
            }

            if (command.FileId != null)
            {
                LoadableFile loadableFile = _entities.Get<LoadableFile>().Single(x => x.Id == command.FileId);
                if (loadableFile == null)
                {
                    throw new Exception("LoadableFile Id " + command.FileId.ToString() + " was not found.");
                }
            }

            if (command.ImageId != null)
            {
                UCosmic.Domain.Images.Image image = _entities.Get<UCosmic.Domain.Images.Image>().Single(x => x.Id == command.ImageId);
                if (image == null)
                {
                    throw new Exception("Image Id " + command.ImageId.ToString() + " was not found.");
                }
            }

            if (command.ProxyImageId != null)
            {
                UCosmic.Domain.Images.Image image = _entities.Get<UCosmic.Domain.Images.Image>().Single(x => x.Id == command.ProxyImageId);
                if (image == null)
                {
                    throw new Exception("Proxy Image Id " + command.ProxyImageId.ToString() + " was not found.");
                }
            } 

            var activityDocument = new ActivityDocument
            {
                ActivityValuesId = activityValues.RevisionId,
                FileId = command.FileId,
                Mode = command.Mode,
                ImageId = command.ImageId,
                ProxyImageId = command.ProxyImageId
            };

            if (command.EntityId != null)
            {
                activityDocument.EntityId = command.EntityId.Value;
            }

            _entities.Create(activityDocument);

            command.CreatedActivityDocument = activityDocument;
        }
    }
}

