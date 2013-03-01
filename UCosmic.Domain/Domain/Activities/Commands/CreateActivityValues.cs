using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ActivityType Type { get; set; }
        public int TypeId { get; set; }
        public ActivityMode Mode { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }

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
            if (activity == null) { throw new Exception("Activity Id " + command.ActivityId.ToString() + " was not found"); }

            ActivityType type = command.Type;
            if (type == null)
            {
                type = _entities.Get<ActivityType>().SingleOrDefault(x => x.Id == command.TypeId);
                if (type == null) { throw new Exception("Activity Type Id " + command.TypeId.ToString() + " was not found"); }
            }

            var activityValues = new ActivityValues
            {
                ActivityId = activity.RevisionId,
                Title = command.Title,
                Content = command.Content,
                StartsOn = command.StartsOn,
                EndsOn = command.EndsOn,
                Type = type,
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded
            };

            _entities.Create(activityValues);

            //activity.Values.Add(activityValues);
            //_entities.Update(activity);

            command.CreatedActivityValues = activityValues;
        }
    }
}

