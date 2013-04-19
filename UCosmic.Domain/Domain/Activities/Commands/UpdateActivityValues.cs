using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivityValues
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }
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
        public DateTime UpdatedOn { get; set; }
        public IPrincipal UpdatedBy { get; set; }
        public bool NoCommit { get; set; }

        public UpdateActivityValues(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class HandleUpdateActivityValuesCommand : IHandleCommands<UpdateActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<DeleteActivityLocation> _deleteActivityLocation; 

        public HandleUpdateActivityValuesCommand(ICommandEntities entities,
                                                 IHandleCommands<CreateActivityLocation> createActivityLocation,
                                                 IHandleCommands<DeleteActivityLocation> deleteActivityLocation)
        {
            _entities = entities;
            _createActivityLocation = createActivityLocation;
            _deleteActivityLocation = deleteActivityLocation;
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

            /* Run through all new locations and attempt to find same in targe.  If found,
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
                    /* Since there are no other fields than Place/PlaceId, there's not much updating
                     * to do. I'll leave this here for future use. */

                    //var updateActivityLocation = new UpdateActivityLocation
                    //{
                    //    Id = targetLocation.RevisionId,
                    //    NoCommit = true
                    //};
                    //_updateActivityLocation.Handle(updateActivityLocation);
                }

            }

            /* Delete activity locations. */
            foreach (ActivityLocation location in target.Locations)
            {
                var updateLocation = command.Locations.SingleOrDefault(x => x.PlaceId == location.PlaceId);
                if (updateLocation == null)
                {
                    var deleteActivityLocationCommand = new DeleteActivityLocation(command.Principal,location.RevisionId)
                    {
                        NoCommit = true
                    };

                    _deleteActivityLocation.Handle(deleteActivityLocationCommand);
                }
            }

            if (!command.NoCommit)
            {
                _entities.Update(target);
            }
        }
    }
}

