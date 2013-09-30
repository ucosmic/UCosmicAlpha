using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityPlace
    {
        public CreateActivityPlace(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public int PlaceId { get; set; }
        public IPrincipal Impersonator { get; set; }
    }

    public class ValidateCreateActivityPlaceCommand : AbstractValidator<CreateActivityPlace>
    {
        public ValidateCreateActivityPlaceCommand(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.PlaceId)
                .MustFindPlaceById(entities)
                .MustNotBeDuplicateActivityPlace(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleCreateActivityPlaceCommand : IHandleCommands<CreateActivityPlace>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityPlaceCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityPlace command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Locations),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            values.Locations.Add(new ActivityLocation
            {
                PlaceId = command.PlaceId,
            });
            activity.UpdatedOnUtc = DateTime.UtcNow;
            activity.UpdatedByPrincipal = command.Impersonator == null
                ? command.Principal.Identity.Name
                : command.Impersonator.Identity.Name;

            _entities.SaveChanges();
        }
    }
}
