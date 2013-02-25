using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public CreateMyNewActivity()
        {
            Values = new Collection<ActivityValues>();
            Tags = new Collection<ActivityTag>();
        }

        public User User { get; set; }
        public string ModeText { get; set; }
        public ICollection<ActivityValues> Values { get; set; }
        public ICollection<ActivityTag> Tags { get; set; }

        public Activity CreatedActivity { get; internal set; }
    }

    public class HandleCreateMyNewActivityCommand : IHandleCommands<CreateMyNewActivity>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateMyNewActivityCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateMyNewActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            Person person = _entities.Get<Person>()
                .Single(p => p.RevisionId == command.User.Person.RevisionId);

            var otherActivities = _entities.Get<Activity>()
                .WithPersonId(command.ModeText, person.RevisionId);

            var activity = new Activity
            {
                Person = person,
                PersonId = person.RevisionId,
                Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                CreatedOn = DateTime.Now,
                UpdatedOn = DateTime.Now,
                UpdatedByUser = command.User,
                UpdatedByUserId = command.User.RevisionId
            };

            foreach (ActivityValues value in command.Values) { activity.Values.Add(value); }

            foreach (ActivityTag tag in command.Tags) { activity.Tags.Add(tag); }

            _entities.Create(activity);

            command.CreatedActivity = activity;
        }
    }
}
