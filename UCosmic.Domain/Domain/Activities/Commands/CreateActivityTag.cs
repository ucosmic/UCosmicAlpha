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
        }

        public int ActivityValuesId { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public ActivityTagDomainType DomainType { get; set; }
        public int? DomainKey { get; set; }
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

            ActivityValues activityValues = _entities.Get<ActivityValues>().SingleOrDefault(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null) { throw new Exception("Activity Values Id " + command.ActivityValuesId.ToString() + " was not found"); }

            Person person = _entities.Get<Person>()
                                     .Single(p => p.RevisionId == activityValues.Activity.Person.RevisionId);

            var otherActivities = _entities.Get<Activity>()
                                           .WithPersonId(person.RevisionId)
                                           .WithMode(command.Mode.AsSentenceFragment());

            var activityTag = new ActivityTag
            {
                ActivityValuesId = activityValues.RevisionId,
                Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Text = command.Text,
                DomainType = command.DomainType,
                DomainKey = command.DomainKey,
                Mode = command.Mode
            };

            _entities.Create(activityTag);

            //activity.Tags.Add(activityTag);
            //_entities.Update(activity);

            command.CreatedActivityTag = activityTag;
        }
    }
}

