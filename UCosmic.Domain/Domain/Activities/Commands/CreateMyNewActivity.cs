using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateMyNewActivity
    {
        public CreateMyNewActivity(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public ActivityMode Mode { get; set; }
        public Activity CreatedActivity { get; internal set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateMyNewActivityCommand : AbstractValidator<CreateMyNewActivity>
    {
        public ValidateCreateMyNewActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // principal is one creating own activity, so must exist
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
                Person = person,
                PersonId = person.RevisionId,
                Mode = command.Mode,
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            _entities.Create(activity);

            command.CreatedActivity = activity;

            if (!command.NoCommit) _entities.SaveChanges();
        }
    }
}
