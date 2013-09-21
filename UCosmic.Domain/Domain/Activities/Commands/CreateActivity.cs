using System;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CreateActivity
    {
        public CreateActivity(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public ActivityMode Mode { get; set; }
        public Activity CreatedActivity { get; internal set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateActivityCommand : AbstractValidator<CreateActivity>
    {
        public ValidateCreateActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
            ;
        }
    }

    public class HandleCreateActivityCommand : IHandleCommands<CreateActivity>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.User,
                })
                .ByUserName(command.Principal.Identity.Name, false);

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
