using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class ReplaceActivity
    {
        public ReplaceActivity(IPrincipal principal, int activityWorkCopyId, int activityOriginalId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            ActivityWorkCopyId = activityWorkCopyId;
            ActivityOriginalId = activityOriginalId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityWorkCopyId { get; private set; }
        public int ActivityOriginalId { get; private set; }
        public ActivityMode Mode { get; set; }
    }

    public class ValidateReplaceActivityCommand : AbstractValidator<ReplaceActivity>
    {
        public ValidateReplaceActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityOriginalId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.ActivityWorkCopyId)
                .MustFindActivityById(queryProcessor)
                .MustBeActivityWorkCopy(queryProcessor, x => x.ActivityOriginalId)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityWorkCopyId)
                .MustOwnActivity(queryProcessor, x => x.ActivityOriginalId)
            ;
        }
    }

    public class HandleReplaceActivityCommand : IHandleCommands<ReplaceActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<MoveActivityDocuments> _moveActivityDocuments;
        private readonly IHandleCommands<CopyActivityValues> _copyActivityValues;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteDocument;

        public HandleReplaceActivityCommand(ICommandEntities entities
            , IHandleCommands<MoveActivityDocuments> moveActivityDocuments
            , IHandleCommands<CopyActivityValues> copyActivityValues
            , IHandleCommands<DeleteActivityDocument> deleteDocument
        )
        {
            _entities = entities;
            _moveActivityDocuments = moveActivityDocuments;
            _copyActivityValues = copyActivityValues;
            _deleteDocument = deleteDocument;
        }

        public void Handle(ReplaceActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var workCopyActivity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                })
                .ById(command.ActivityWorkCopyId, false);
            var workCopyValues = workCopyActivity.Values.Single(x => x.Mode == workCopyActivity.Mode);

            var originalActivity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                })
                .ById(command.ActivityOriginalId, false);

            var originalValues = originalActivity.Values.SingleOrDefault(x => x.Mode == command.Mode);
            if (originalValues == null)
            {
                var copyValuesCommand = new CopyActivityValues(command.Principal)
                {
                    ActivityValuesId = workCopyValues.RevisionId,
                    Mode = command.Mode,
                    CopyToActivity = originalActivity,
                    NoCommit = true,
                };
                _copyActivityValues.Handle(copyValuesCommand);
                originalValues = copyValuesCommand.CreatedActivityValues;
            }
            else
            {
                originalValues.UpdatedByPrincipal = command.Principal.Identity.Name;
                originalValues.UpdatedOnUtc = DateTime.UtcNow;
            }

            originalActivity.Mode = command.Mode;
            originalActivity.UpdatedByPrincipal = command.Principal.Identity.Name;
            originalActivity.UpdatedOnUtc = DateTime.UtcNow;
            originalValues.Title = workCopyValues.Title;
            originalValues.Content = workCopyValues.Content;
            originalValues.DateFormat = workCopyValues.DateFormat;
            originalValues.StartsOn = workCopyValues.StartsOn;
            originalValues.EndsOn = workCopyValues.EndsOn;
            originalValues.OnGoing = workCopyValues.OnGoing;
            originalValues.WasExternallyFunded = workCopyValues.WasExternallyFunded;
            originalValues.WasInternallyFunded = workCopyValues.WasInternallyFunded;

            // delete places
            var placesToDelete = originalValues.Locations
                .Where(x => !workCopyValues.Locations.Select(y => y.PlaceId).Contains(x.PlaceId)).ToArray();
            foreach (var placeToDelete in placesToDelete)
                _entities.Purge(placeToDelete);

            // add places
            var placesToAdd = workCopyValues.Locations
                .Where(x => !originalValues.Locations.Select(y => y.PlaceId).Contains(x.PlaceId)).ToArray();
            foreach (var placeToAdd in placesToAdd)
                placeToAdd.ActivityValues = originalValues;

            // delete types
            var typesToDelete = originalValues.Types
                .Where(x => !workCopyValues.Types.Select(y => y.TypeId).Contains(x.TypeId)).ToArray();
            foreach (var typeToDelete in typesToDelete)
                _entities.Purge(typeToDelete);

            // add types
            var typesToAdd = workCopyValues.Types
                .Where(x => !originalValues.Types.Select(y => y.TypeId).Contains(x.TypeId)).ToArray();
            foreach (var typeToAdd in typesToAdd)
                typeToAdd.ActivityValues = originalValues;

            // delete tags
            var tagsToDelete = originalValues.Tags.ToArray();
            foreach (var tagToDelete in tagsToDelete)
                if (!workCopyValues.Tags.Any(x => x.Text == tagToDelete.Text && x.DomainTypeText == tagToDelete.DomainTypeText && x.DomainKey == tagToDelete.DomainKey))
                    _entities.Purge(tagToDelete);

            // add tags
            var tagsToAdd = workCopyValues.Tags.ToArray();
            foreach (var tagToAdd in tagsToAdd)
                if (!originalValues.Tags.Any(x => x.Text == tagToAdd.Text && x.DomainTypeText == tagToAdd.DomainTypeText && x.DomainKey == tagToAdd.DomainKey))
                    tagToAdd.ActivityValues = originalValues;

            // delete documents
            var documentsToDelete = originalValues.Documents
                .Where(x => !workCopyValues.Documents.Select(y => y.EntityId).Contains(x.EntityId)).ToArray();
            foreach (var documentToDelete in documentsToDelete)
                _deleteDocument.Handle(new DeleteActivityDocument(command.Principal, documentToDelete.RevisionId)
                {
                    NoCommit = true,
                });

            // add documents
            var documentsToAdd = workCopyValues.Documents
                .Where(x => !originalValues.Documents.Select(y => y.EntityId).Contains(x.EntityId)).ToArray();
            foreach (var documentToAdd in documentsToAdd)
                documentToAdd.ActivityValues = originalValues;

            // update documents
            var documentsToUpdate = originalValues.Documents
                .Where(x => workCopyValues.Documents.Select(y => y.EntityId).Contains(x.EntityId)).ToArray();
            foreach (var documentToUpdate in documentsToUpdate)
            {
                var documentToSource = workCopyValues.Documents.Single(x => x.EntityId == documentToUpdate.EntityId);
                if (documentToUpdate.Title != documentToSource.Title)
                {
                    documentToUpdate.Title = documentToSource.Title;
                    documentToUpdate.UpdatedByPrincipal = command.Principal.Identity.Name;
                    documentToUpdate.UpdatedOnUtc = DateTime.UtcNow;
                }
                _deleteDocument.Handle(new DeleteActivityDocument(command.Principal, documentToSource.RevisionId)
                {
                    NoCommit = true,
                });
            }

            _entities.Purge(workCopyActivity);
            _entities.SaveChanges();
            _moveActivityDocuments.Handle(new MoveActivityDocuments(originalActivity.RevisionId));
        }
    }
}
