using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class PurgeActivityType
    {
        public PurgeActivityType(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int ActivityTypeId { get; set; }
        public IPrincipal Impersonator { get; set; }
    }

    public class ValidatePurgeActivityTypeCommand : AbstractValidator<PurgeActivityType>
    {
        public ValidatePurgeActivityTypeCommand(IProcessQueries queryProcessor)
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

    public class HandlePurgeActivityTypeCommand : IHandleCommands<PurgeActivityType>
    {
        private readonly ICommandEntities _entities;

        public HandlePurgeActivityTypeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(PurgeActivityType command)
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

            activity.UpdatedOnUtc = DateTime.UtcNow;
            activity.UpdatedByPrincipal = command.Impersonator == null
                ? command.Principal.Identity.Name
                : command.Impersonator.Identity.Name;
            _entities.SaveChanges();
        }
    }
}
