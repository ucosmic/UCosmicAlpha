using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class PurgeActivityPlace
    {
        public PurgeActivityPlace(IPrincipal principal, int activityId)
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

    public class ValidatePurgeActivityPlaceCommand : AbstractValidator<PurgeActivityPlace>
    {
        public ValidatePurgeActivityPlaceCommand(IProcessQueries queryProcessor)
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

    public class HandlePurgeActivityPlaceCommand : IHandleCommands<PurgeActivityPlace>
    {
        private readonly ICommandEntities _entities;

        public HandlePurgeActivityPlaceCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(PurgeActivityPlace command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Locations),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            if (values.Locations.All(x => x.PlaceId != command.PlaceId)) return;

            var locations = values.Locations.Where(x => x.PlaceId == command.PlaceId).ToArray();
            foreach (var location in locations) _entities.Purge(location);

            activity.UpdatedOnUtc = DateTime.UtcNow;
            activity.UpdatedByPrincipal = command.Impersonator == null
                ? command.Principal.Identity.Name
                : command.Impersonator.Identity.Name;
            _entities.SaveChanges();
        }
    }
}
