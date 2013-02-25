using System;
using System.Linq;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityTag
    {
        public CreateActivityTag()
        {
            DomainType = ActivityTagDomainType.Custom;
            IsInstitution = false;
        }

        public Activity Activity { get; set; }
        public int ActivityId { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public ActivityTagDomainType DomainType { get; set; }
        public int? DomainKey { get; set; }
        public bool IsInstitution { get; set; }
        public ActivityMode Mode { get; set; }

        public ActivityTag CreatedActivityTag { get; protected internal set; }
    }

    public class HandleCreateActivityTagCommand : IHandleCommands<CreateActivityTag>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityTagCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            Activity activity = command.Activity;
            if (activity == null)
            {
                activity = _entities.Get<Activity>().SingleOrDefault(x => x.Id == command.ActivityId);
                if (activity == null) { throw new Exception("Activity Id " + command.ActivityId.ToString() + " was not found"); }
            }

            Person person = _entities.Get<Person>()
                                     .Single(p => p.RevisionId == activity.Person.RevisionId);

            var otherActivities = _entities.Get<Activity>()
                                           .WithPersonId(command.Mode.AsSentenceFragment(), person.RevisionId);

            var activityTag = new ActivityTag
            {
                Activity = activity,
                Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Text = command.Text,
                DomainType = command.DomainType,
                DomainKey = command.DomainKey,
                IsInstitution = command.IsInstitution,
                Mode = command.Mode
            };

            _entities.Create(activityTag);

            command.CreatedActivityTag = activityTag;
        }
    }
}

