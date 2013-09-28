using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class AddActivityTag
    {
        public AddActivityTag(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public string Text { get; set; }
        public ActivityTagDomainType DomainType { get; set; }
        public int? DomainKey { get; set; }
    }

    public class ValidateAddActivityTagCommand : AbstractValidator<AddActivityTag>
    {
        public ValidateAddActivityTagCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.Text)
                .NotEmpty().WithName("Activity tag text")
                .MustNotBeDuplicateActivityTag(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleAddActivityTagCommand : IHandleCommands<AddActivityTag>
    {
        private readonly ICommandEntities _entities;

        public HandleAddActivityTagCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(AddActivityTag command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Tags),
                })
                .ById(command.ActivityId, false);
            var values = activity.Values.Single(x => x.Mode == activity.Mode);
            values.Tags.Add(new ActivityTag
            {
                Text = command.Text,
                DomainType = command.DomainType,
                DomainKey = command.DomainKey,
            });

            _entities.SaveChanges();
        }
    }
}
