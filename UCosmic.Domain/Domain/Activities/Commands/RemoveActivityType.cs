using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class RemoveActivityType
    {
        public RemoveActivityType(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int ActivityTypeId { get; set; }
    }

    public class ValidateRemoveActivityTypeCommand : AbstractValidator<RemoveActivityType>
    {
        public ValidateRemoveActivityTypeCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleRemoveActivityTypeCommand : IHandleCommands<RemoveActivityType>
    {
        private readonly ICommandEntities _entities;

        public HandleRemoveActivityTypeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(RemoveActivityType command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Types),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            if (values.Types.All(x => x.TypeId != command.ActivityTypeId)) return;

            var types = values.Types.Where(x => x.TypeId == command.ActivityTypeId).ToArray();
            foreach (var type in types) _entities.Purge(type);

            _entities.SaveChanges();
        }
    }
}
