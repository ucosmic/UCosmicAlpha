using System;
using System.Linq;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public Guid? EntityId { get; set; }
        public User User { get; set; }
        public string ModeText { get; set; }
        public int? EditSourceId { get; set; }

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
                                           .WithPersonId(person.RevisionId)
                                           .WithMode(command.ModeText);

            var activity = new Activity
            {
                PersonId = person.RevisionId,
                Number = (otherActivities != null) ? otherActivities.NextNumber() : 0,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                EditSourceId = command.EditSourceId,

                CreatedByPrincipal = person.DisplayName,
                UpdatedByPrincipal = person.DisplayName,
                UpdatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId != null)
            {
                activity.EntityId = command.EntityId.Value;
            }

            _entities.Create(activity);

            command.CreatedActivity = activity;
        }
    }
}
