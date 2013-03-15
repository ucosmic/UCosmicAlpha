using System;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityDocument
    {
        public Guid? EntityId { get; set; }
        public int ActivityId { get; set; }
        public int LoadableFileId { get; set; }

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

            Activity activity = _entities.Get<Activity>().Single(x => x.RevisionId == command.ActivityId);
            if (activity == null) { throw new Exception("Activity Id " + command.ActivityId.ToString() + " was not found."); }

            LoadableFile loadableFile = _entities.Get<LoadableFile>().Single(x => x.Id == command.LoadableFileId);
            if (loadableFile == null) { throw new Exception("LoadableFile Id " + command.LoadableFileId.ToString() + " was not found."); }

            var activityDocument = new ActivityDocument
            {
                ActivityId = activity.RevisionId,
                DocumentId = loadableFile.Id,
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

