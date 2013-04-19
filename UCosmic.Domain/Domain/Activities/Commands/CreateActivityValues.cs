using System;
using System.Linq;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ActivityMode Mode { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public bool NoCommit { get; set; }
        public ActivityValues CreatedActivityValues { get; protected internal set; }
    }

    public class HandleCreateActivityValuesCommand : IHandleCommands<CreateActivityValues>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityValuesCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            Activity activity = _entities.Get<Activity>().SingleOrDefault(x => x.RevisionId == command.ActivityId);
            if (activity == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("Activity Id '{0}' was not found", command.ActivityId));
            }

            var activityValues = new ActivityValues
            {
                ActivityId = activity.RevisionId,
                Title = command.Title,
                Content = command.Content,
                StartsOn = command.StartsOn,
                EndsOn = command.EndsOn,
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded
            };

            command.CreatedActivityValues = activityValues;

            if (!command.NoCommit)
            {
                _entities.Create(activityValues);
            }
        }
    }
}

