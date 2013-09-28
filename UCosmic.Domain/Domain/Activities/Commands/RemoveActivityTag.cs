using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class RemoveActivityTag
    {
        public RemoveActivityTag(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public string ActivityTagText { get; set; }
    }

    public class ValidateRemoveActivityTagCommand : AbstractValidator<RemoveActivityTag>
    {
        public ValidateRemoveActivityTagCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.ActivityTagText)
                .NotEmpty().WithName("Activity tag text")
            ;
        }
    }

    public class HandleRemoveActivityTagCommand : IHandleCommands<RemoveActivityTag>
    {
        private readonly ICommandEntities _entities;

        public HandleRemoveActivityTagCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(RemoveActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Tags),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            if (values.Tags.All(x => !x.Text.Equals(command.ActivityTagText, StringComparison.OrdinalIgnoreCase))) return;

            var tags = values.Tags.Where(x => x.Text.Equals(command.ActivityTagText, StringComparison.OrdinalIgnoreCase)).ToArray();
            foreach (var tag in tags) _entities.Purge(tag);

            _entities.SaveChanges();
        }
    }
}
