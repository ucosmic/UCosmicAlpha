using System;
using System.Collections.ObjectModel;
using System.Linq.Expressions;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class CopyActivityValues
    {
        internal CopyActivityValues(IPrincipal principal)
        {
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
        internal int ActivityValuesId { get; set; }
        internal int CopyToActivityId { get; set; }
        internal Activity CopyToActivity { get; set; }
        internal ActivityMode Mode { get; set; }
        internal ActivityValues CreatedActivityValues { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class HandleCopyActivityValuesCommand : IHandleCommands<CopyActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _detachedEntities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;

        public HandleCopyActivityValuesCommand(ICommandEntities entities
            , IQueryEntities detachedEntities
            , IStoreBinaryData binaryData
            , IHandleCommands<CreateActivityDocument> createActivityDocument
        )
        {
            _entities = entities;
            _detachedEntities = detachedEntities;
            _binaryData = binaryData;
            _createActivityDocument = createActivityDocument;
        }

        public void Handle(CopyActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var copyToActivity = command.CopyToActivity
                ?? _entities.Get<Activity>().ById(command.CopyToActivityId);

            var copiedActivityValues = _detachedEntities.Query<ActivityValues>()
                .EagerLoad(_entities, new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Locations,
                    x => x.Types,
                    x => x.Tags,
                    x => x.Documents,
                })
                .ById(command.ActivityValuesId);

            copiedActivityValues.Activity = copyToActivity;
            copiedActivityValues.ActivityId = copyToActivity.RevisionId;
            copiedActivityValues.Mode = command.Mode;
            copiedActivityValues.RevisionId = 0;
            EnableForCopy(copiedActivityValues, command);

            foreach (var location in copiedActivityValues.Locations) EnableForCopy(location, command);

            foreach (var type in copiedActivityValues.Types) EnableForCopy(type, command);

            foreach (var tag in copiedActivityValues.Tags) EnableForCopy(tag, command);

            var documentsToCopy = copiedActivityValues.Documents;
            copiedActivityValues.Documents = new Collection<ActivityDocument>();
            foreach (var document in documentsToCopy)
            {
                _createActivityDocument.Handle(new CreateActivityDocument(command.Principal)
                {
                    ActivityValues = copiedActivityValues,
                    FileName = document.FileName,
                    MimeType = document.MimeType,
                    Content = _binaryData.Get(document.Path),
                    Title = document.Title,
                    EntityId = document.EntityId,
                    NoCommit = true,
                });
            }

            command.CreatedActivityValues = copiedActivityValues;
            _entities.Create(copiedActivityValues);
            if (!command.NoCommit) _entities.SaveChanges();
        }

        private static void EnableForCopy(RevisableEntity entity, CopyActivityValues command)
        {
            entity.EntityId = Guid.NewGuid();
            entity.CreatedOnUtc = DateTime.UtcNow;
            entity.CreatedByPrincipal = command.Principal.Identity.Name;
        }
    }
}
