using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivity
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public string ModeText { get; set; }
        public ActivityValues Values { get; set; }
        public DateTime UpdatedOn { get; set; }
        public IPrincipal UpdatedBy { get; set; }
        public bool NoCommit { get; set; }

        public UpdateActivity(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateUpdateActivityCommand : AbstractValidator<UpdateActivity>
    {
        public ValidateUpdateActivityCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivityDocument(entities, x => x.Id)
                .WithMessage(MustOwnActivity<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Activity id", x => x.Id)

                // id must exist in the database
                .MustFindActivityDocumentById(entities)
                .WithMessage(MustFindActivityById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyActivityCommand : IHandleCommands<UpdateActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateActivityValues> _updateActivityValues;

        public HandleUpdateMyActivityCommand(ICommandEntities entities,
                                             IHandleCommands<UpdateActivityValues> updateActivityValues)
        {
            _entities = entities;
            _updateActivityValues = updateActivityValues;
        }

        public void Handle(UpdateActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the activity to update. */
            var activity = _entities.Get<Activity>().Single(a => a.RevisionId == command.Id);

            /* Retrieve the activty values of the same mode. */
            var activityValues = _entities.Get<ActivityValues>()
                                    .Single(v => (v.RevisionId == command.Id) && (v.ModeText == command.ModeText));

            /* If target fields equal new field values, we do not proceed. */
            if ((activity.ModeText == command.ModeText) &&
                (activityValues.Equals(command.Values)))
            {
                return;
            }

            /* Update fields */
            activity.Mode = command.ModeText.AsEnum<ActivityMode>();
            activity.UpdatedOnUtc = command.UpdatedOn;
            activity.UpdatedByPrincipal = command.UpdatedBy.Identity.Name;

            /* Update activity values (for this mode) */
            var updateActivityValuesCommand = new UpdateActivityValues(command.Principal, activityValues.RevisionId)
            {
                Title = command.Values.Title,
                Content = command.Values.Content,
                StartsOn = command.Values.StartsOn,
                EndsOn = command.Values.EndsOn,
                Mode = command.Values.Mode,
                WasExternallyFunded = command.Values.WasExternallyFunded,
                WasInternallyFunded = command.Values.WasInternallyFunded,
                Locations = command.Values.Locations,
                Types = command.Values.Types,
                Tags = command.Values.Tags,
                Documents = command.Values.Documents,
                UpdatedOn = command.UpdatedOn,
                UpdatedBy = command.UpdatedBy,
                NoCommit = true
            };

            _updateActivityValues.Handle(updateActivityValuesCommand);

            if (!command.NoCommit)
            {
                _entities.Update(activity);
            }
        }
    }
}
