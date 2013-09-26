using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class AddActivityType
    {
        public AddActivityType(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int ActivityTypeId { get; set; }
    }

    public class ValidateAddActivityTypeCommand : AbstractValidator<AddActivityType>
    {
        public ValidateAddActivityTypeCommand(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.ActivityTypeId)
                .MustFindActivityTypeById(entities)
                .MustBeActivityTypeForPrincipal(queryProcessor, x => x.Principal)
                .MustNotBeDuplicateActivityType(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleAddActivityTypeCommand : IHandleCommands<AddActivityType>
    {
        private readonly ICommandEntities _entities;

        public HandleAddActivityTypeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(AddActivityType command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Types),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            values.Types.Add(new ActivityType
            {
                TypeId = command.ActivityTypeId,
            });

            _entities.SaveChanges();
        }
    }
}
