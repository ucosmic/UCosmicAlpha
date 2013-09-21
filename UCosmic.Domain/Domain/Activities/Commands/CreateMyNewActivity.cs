using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public CreateMyNewActivity(IPrincipal principal, string modeText)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (modeText == null) throw new ArgumentNullException("modeText");
            Principal = principal;
            ModeText = modeText;
        }

        public IPrincipal Principal { get; private set; }
        public string ModeText { get; private set; }
        public Guid? EntityId { get; set; }
        public int? EditSourceId { get; set; }
        public Activity CreatedActivity { get; internal set; }
        //internal bool NoCommit { get; set; }
    }

    public class ValidateCreateMyNewActivityCommand : AbstractValidator<CreateMyNewActivity>
    {
        public ValidateCreateMyNewActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
            ;
        }
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

            var person = _entities.Get<Person>().ByUserName(command.Principal.Identity.Name, false);

            var activity = new Activity
            {
                PersonId = person.RevisionId,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };
            if (command.EditSourceId.HasValue)
                activity.Original = _entities.Get<Activity>().Single(x => x.RevisionId == command.EditSourceId);

            if (command.EntityId.HasValue)
            {
                activity.EntityId = command.EntityId.Value;
            }

            _entities.Create(activity);

            command.CreatedActivity = activity;

            //if (!command.NoCommit)
            //{
                _entities.SaveChanges();

                //if (!command.NoEvents)
                //{
                    //_eventProcessor.Raise(new ActivityCreated
                    //{
                    //    ActivityId = command.CreatedActivity.RevisionId
                    //});
                //}
            //}
        }
    }
}
