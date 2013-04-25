using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivity
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public DateTime UpdatedOn { get; protected set; }
        public string ModeText { get; protected set; }
        public int Number { get; set; }
        public ActivityValues Values { get; set; }
        public bool NoCommit { get; set; }

        public UpdateActivity(IPrincipal principal, int id, DateTime updatedOn, string modeText)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
            ModeText = modeText;
        }
    }

    public class ValidateUpdateActivityCommand : AbstractValidator<UpdateActivity>
    {
        public ValidateUpdateActivityCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnActivity(entities, x => x.Id)
                .WithMessage(MustOwnActivity<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Activity id", x => x.Id)

                // id must exist in the database
                .MustFindActivityById(entities)
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
            var target = _entities.Get<Activity>().Single(a => a.RevisionId == command.Id);

            /* Retrieve the target activty values of the same mode. */
            var targetActivityValues = _entities.Get<ActivityValues>()
                                            .Single(v => (v.ActivityId == target.RevisionId) && 
                                                         (v.ModeText == command.ModeText));


            /* If target fields equal new field values, we do not proceed. */
            if ( (target.ModeText == command.ModeText) &&
                 (targetActivityValues.Equals(command.Values)) )
            {
                return;
            }

            /* Update fields */
            target.ModeText = command.ModeText;
            target.Number = command.Number;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            /* Update activity values (for this mode) */
            var updateActivityValuesCommand = new UpdateActivityValues(command.Principal,
                                                                       targetActivityValues.RevisionId,
                                                                       command.UpdatedOn)
            {
                Title = command.Values.Title,
                Content = command.Values.Content,
                StartsOn = command.Values.StartsOn,
                EndsOn = command.Values.EndsOn,
                Mode = command.Values.Mode,
                WasExternallyFunded = command.Values.WasExternallyFunded,
                WasInternallyFunded = command.Values.WasInternallyFunded,
                Locations = command.Values.Locations ?? new Collection<ActivityLocation>(),
                Types = command.Values.Types ?? new Collection<ActivityType>(),
                Tags = command.Values.Tags ?? new Collection<ActivityTag>(),
                Documents = command.Values.Documents ?? new Collection<ActivityDocument>(),
                NoCommit = true
            };

            _updateActivityValues.Handle(updateActivityValuesCommand);

            if (!command.NoCommit)
            {
                _entities.Update(target);
            }
        }
    }
}
