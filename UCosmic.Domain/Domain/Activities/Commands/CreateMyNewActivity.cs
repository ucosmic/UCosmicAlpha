using System;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public IPrincipal Principal { get; set; }
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

            //var person = _queryProcessor.Execute(
            //    new GetMyPersonQuery(command.Principal));
            var person = _entities.Get<Person>()
                .ByUserName(command.Principal.Identity.Name);

            var otherActivities = _entities.Get<Activity>()
                .WithPersonId(person.RevisionId)
            ;

            var activity = new Activity
            {
                Person = person,
                PersonId = person.RevisionId,
                Number = otherActivities.NextNumber(),
            };
            _entities.Create(activity);
            command.CreatedActivity = activity;
        }
    }
}
