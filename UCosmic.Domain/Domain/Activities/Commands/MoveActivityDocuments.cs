using System;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Activities
{
    public class MoveActivityDocuments
    {
        internal MoveActivityDocuments(int? activityId = null)
        {
            ActivityId = activityId;
        }

        public int? ActivityId { get; private set; }
    }

    public class HandleMoveActivityDocumentsCommand : IHandleCommands<MoveActivityDocuments>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public HandleMoveActivityDocumentsCommand(ICommandEntities entities, IStoreBinaryData binaryData)
        {
            _entities = entities;
            _binaryData = binaryData;
        }

        public void Handle(MoveActivityDocuments command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var queryable = _entities.Get<ActivityDocument>()
                .EagerLoad(_entities, new Expression<Func<ActivityDocument, object>>[]
                {
                    x => x.ActivityValues,
                })
            ;
            if (command.ActivityId.HasValue)
                queryable = queryable.Where(x => x.ActivityValues.ActivityId == command.ActivityId);

            var entities = queryable.ToArray();
            foreach (var entity in entities)
            {
                if (entity.Path.StartsWith(string.Format(ActivityDocument.PathFormat, entity.ActivityValues.ActivityId, "")))
                    continue;

                var oldPath = entity.Path;
                var newPath = string.Format(ActivityDocument.PathFormat, entity.ActivityValues.ActivityId, Guid.NewGuid());
                try
                {
                    _binaryData.Move(oldPath, newPath);
                    entity.Path = newPath;
                    _entities.SaveChanges();
                }
                catch
                {
                    if (_binaryData.Exists(newPath)) _binaryData.Move(newPath, oldPath);
                }
            }
        }
    }
}
