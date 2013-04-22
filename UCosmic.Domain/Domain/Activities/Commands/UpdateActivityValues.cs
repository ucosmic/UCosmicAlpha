﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityValues
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public DateTime UpdatedOn { get; protected set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ActivityMode Mode { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public virtual ICollection<ActivityLocation> Locations { get; set; }
        public virtual ICollection<ActivityType> Types { get; set; }
        public virtual ICollection<ActivityTag> Tags { get; set; }
        public virtual ICollection<ActivityDocument> Documents { get; set; }

        public IPrincipal UpdatedBy { get; set; }
        public bool NoCommit { get; set; }

        public UpdateActivityValues(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            if (updatedOn == null) { throw new ArgumentNullException("updatedOn"); }

            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn.ToUniversalTime();
        }
    }

    public class HandleUpdateActivityValuesCommand : IHandleCommands<UpdateActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<UpdateActivityLocation> _updateActivityLocation;
        private readonly IHandleCommands<DeleteActivityLocation> _deleteActivityLocation;
        private readonly IHandleCommands<CreateActivityType> _createActivityType;
        private readonly IHandleCommands<UpdateActivityType> _updateActivityType;
        private readonly IHandleCommands<DeleteActivityType> _deleteActivityType;
        private readonly IHandleCommands<CreateActivityTag> _createActivityTag;
        private readonly IHandleCommands<DeleteActivityTag> _deleteActivityTag;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IHandleCommands<UpdateActivityDocument> _updateActivityDocument;
        private readonly IHandleCommands<DeleteActivityDocument> _deleteActivityDocument;

        public HandleUpdateActivityValuesCommand(ICommandEntities entities,
                                                 IHandleCommands<CreateActivityLocation> createActivityLocation,
                                                 IHandleCommands<UpdateActivityLocation> updateActivityLocation,
                                                 IHandleCommands<DeleteActivityLocation> deleteActivityLocation,
                                                 IHandleCommands<CreateActivityType> createActivityType,
                                                 IHandleCommands<UpdateActivityType> updateActivityType,
                                                 IHandleCommands<DeleteActivityType> deleteActivityType,
                                                 IHandleCommands<CreateActivityTag> createActivityTag,
                                                 IHandleCommands<DeleteActivityTag> deleteActivityTag,            
                                                 IHandleCommands<CreateActivityDocument> createActivityDocument,
                                                 IHandleCommands<UpdateActivityDocument> updateActivityDocument,
                                                 IHandleCommands<DeleteActivityDocument> deleteActivityDocument )
        {
            _entities = entities;
            _createActivityLocation = createActivityLocation;
            _updateActivityLocation = updateActivityLocation;
            _deleteActivityLocation = deleteActivityLocation;
            _createActivityType = createActivityType;
            _updateActivityType = updateActivityType;
            _deleteActivityType = deleteActivityType;
            _createActivityTag = createActivityTag;
            _deleteActivityTag= deleteActivityTag;
            _createActivityDocument = createActivityDocument;
            _updateActivityDocument = updateActivityDocument;
            _deleteActivityDocument = deleteActivityDocument;
       }

        public class ValidateUpdateActivityValuesCommand : AbstractValidator<UpdateActivityValues>
        {
            public ValidateUpdateActivityValuesCommand(IQueryEntities entities)
            {
                CascadeMode = CascadeMode.StopOnFirstFailure;

                RuleFor(x => x.Principal)
                    .MustOwnActivityDocument(entities, x => x.Id)
                    .WithMessage(MustOwnActivityValues<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

                RuleFor(x => x.Id)
                    // id must be within valid range
                    .GreaterThanOrEqualTo(1)
                        .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityValues id", x => x.Id)

                    // id must exist in the database
                    .MustFindActivityDocumentById(entities)
                        .WithMessage(MustFindActivityValuesById.FailMessageFormat, x => x.Id)
                ;
            }
        }

        public void Handle(UpdateActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Get the activity values we are updating. */
            var target = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.Id);

            /* Populate an activity with new values. */
            var update = new ActivityValues
            {
                Title = command.Title,
                Content = command.Content,
                StartsOn = command.StartsOn,
                EndsOn = command.EndsOn,
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded,
                Locations = command.Locations,
                Types = command.Types,
                Tags =  command.Tags,
                Documents = command.Documents
            };

            /* If the new values are same as current, leave. */
            if (target.Equals(update))
            {
                return;
            }

            /* Update static fields */
            target.Title = command.Title;
            target.Content = command.Content;
            target.StartsOn = command.StartsOn;
            target.EndsOn = command.EndsOn;
            target.Mode = command.Mode;
            target.WasExternallyFunded = command.WasExternallyFunded;
            target.WasInternallyFunded = command.WasInternallyFunded;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.UpdatedBy.Identity.Name;

            /* ----- Activity Locations ----- */

            /* Run through all new locations and attempt to find same in target.  If found,
             * update.  If not, create. */
            foreach (var location in command.Locations)
            {
                var targetLocation = target.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (targetLocation == null)
                {
                    var createActivityLocation = new CreateActivityLocation
                    {
                        ActivityValuesId = target.RevisionId,
                        PlaceId = location.PlaceId,
                        NoCommit = true
                    };

                    _createActivityLocation.Handle(createActivityLocation);
                }
                else
                {
                    var updateActivityLocation = new UpdateActivityLocation(command.UpdatedBy,
                                                                            target.RevisionId,
                                                                            command.UpdatedOn)
                    {
                        NoCommit = true
                    };
                    _updateActivityLocation.Handle(updateActivityLocation);
                }

            }

            /* Delete activity locations. Run through the targets list of locations and try to find
                a matching one in the updated list.  If not found, it must have been deleted. */
            foreach (var location in target.Locations)
            {
                var updateLocation = command.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (updateLocation == null)
                {
                    var deleteActivityLocationCommand = new DeleteActivityLocation(command.Principal,
                                                                                   location.RevisionId)
                    {
                        NoCommit = true
                    };

                    _deleteActivityLocation.Handle(deleteActivityLocationCommand);
                }
            }

            /* ----- Activity Types ----- */

            foreach (var type in command.Types)
            {
                var targetType = target.Types.SingleOrDefault(x => x.TypeId == type.TypeId);
                if (targetType == null)
                {
                    var createActivityType = new CreateActivityType
                    {
                        ActivityValuesId = target.RevisionId,
                        EmployeeActivityTypeId = type.TypeId,
                        NoCommit = true
                    };

                    _createActivityType.Handle(createActivityType);
                }
                else
                {
                    var updateActivityType = new UpdateActivityType(command.Principal,
                                                                    targetType.RevisionId,
                                                                    command.UpdatedOn)
                    {
                        TypeId = type.TypeId,
                        NoCommit = true
                    };
                    _updateActivityType.Handle(updateActivityType);
                }
            }

            foreach (var type in target.Types)
            {
                var updateType = command.Types.SingleOrDefault(x => x.TypeId == type.TypeId);
                if (updateType == null)
                {
                    var deleteActivityTypeCommand = new DeleteActivityType(command.Principal, type.RevisionId)
                    {
                        NoCommit = true
                    };
                    _deleteActivityType.Handle(deleteActivityTypeCommand);
                }
            }

            /* ----- Activity Tags ----- */

            /* Activity tags are not updated.  They either exist or not. */
            foreach (var tag in command.Tags)
            {
                var targetTag = target.Tags.SingleOrDefault(x => x.Text == tag.Text);
                if (targetTag == null)
                {
                    var createActivityTag = new CreateActivityTag
                    {
                        ActivityValuesId = target.RevisionId,
                        Number = tag.Number,
                        Text = tag.Text,
                        DomainType = tag.DomainType,
                        DomainKey = tag.DomainKey,
                        Mode = tag.Mode,
                        NoCommit = true
                    };
                    _createActivityTag.Handle(createActivityTag);
                }
            }

            foreach (var tag in target.Tags)
            {
                var updateTag = command.Tags.SingleOrDefault(x => x.Text == tag.Text);
                if (updateTag == null)
                {
                    var deleteActivityTagCommand = new DeleteActivityTag(command.Principal, tag.RevisionId)
                    {
                        NoCommit = true
                    };
                    _deleteActivityTag.Handle(deleteActivityTagCommand);
                }
            }

            /* ----- Activity Documents ----- */

            foreach (var document in command.Documents)
            {
                ActivityDocument targetDocument = null;

                if (document.FileId.HasValue)
                {
                    targetDocument = target.Documents.SingleOrDefault(x => x.FileId == document.FileId);
                }
                else if (document.ImageId.HasValue)
                {
                    targetDocument = target.Documents.SingleOrDefault(x => x.ImageId == document.ImageId);
                }

                if (targetDocument == null)
                {
                    var createActivityDocument = new CreateActivityDocument
                    {
                        ActivityValuesId = target.RevisionId,
                        FileId = document.FileId,
                        ImageId = document.ImageId,
                        Mode = document.Mode,
                        Title = document.Title,
                        Visible = document.Visible,
                        NoCommit = true
                    };
                    _createActivityDocument.Handle(createActivityDocument);
                }
                else
                {
                    var updateActivityDocument = new UpdateActivityDocument(command.Principal,
                                                                            targetDocument.RevisionId,
                                                                            command.UpdatedOn)
                    {
                        FileId = document.FileId,
                        ImageId = document.ImageId,
                        Mode = document.Mode,
                        Title = document.Title,
                        Visible = document.Visible,
                        NoCommit = true
                    };
                    _updateActivityDocument.Handle(updateActivityDocument);
                }
            }

            foreach (var document in target.Documents)
            {
                ActivityDocument updateDocument = null;

                if (document.FileId.HasValue)
                {
                    updateDocument = command.Documents.SingleOrDefault(x => x.FileId == document.FileId);
                }
                else if (document.ImageId.HasValue)
                {
                    updateDocument = command.Documents.SingleOrDefault(x => x.ImageId == document.ImageId);
                }

                if (updateDocument != null)
                {
                    var deleteActivityDocumentCommand = new DeleteActivityDocument(command.Principal, document.RevisionId)
                    {
                        NoCommit = true
                    };
                    _deleteActivityDocument.Handle(deleteActivityDocumentCommand);
                }
            }


            if (!command.NoCommit)
            {
                _entities.Update(target);
            }
        }
    }
}
