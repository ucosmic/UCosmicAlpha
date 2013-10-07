using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class UpdateActivity
    {
        public UpdateActivity(IPrincipal principal, int activityId)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public ActivityMode? Mode { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public IPrincipal Impersonator { get; set; }
    }

    public class ValidateUpdateActivityCommand : AbstractValidator<UpdateActivity>
    {
        public ValidateUpdateActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                .MustFindActivityById(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId);

            When(x => IsActivity.Original(x.ActivityId, queryProcessor), () =>
            {
                RuleFor(x => x.Title).NotEmpty().WithName("Activity title")
                    .Length(1, ActivityValuesConstraints.TitleMaxLength)
                ;

                RuleFor(x => x.Content).NotEmpty().WithName("Activity description")
                ;
            });
        }
    }

    public class HandleUpdateActivityCommand : IHandleCommands<UpdateActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CopyActivityValues> _copyActivityValues;

        public HandleUpdateActivityCommand(ICommandEntities entities, IHandleCommands<CopyActivityValues> copyActivityValues)
        {
            _entities = entities;
            _copyActivityValues = copyActivityValues;
        }

        public void Handle(UpdateActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            if (command.OnGoing.HasValue && command.OnGoing.Value)
                command.EndsOn = null;

            var activity = _entities.Get<Activity>()
                .EagerLoad(_entities, new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                })
                .ById(command.ActivityId, false);
            if (command.Mode.HasValue && command.Mode.Value != activity.Mode)
                activity.Mode = command.Mode.Value;
            activity.UpdatedByPrincipal = command.Impersonator == null
                ? command.Principal.Identity.Name
                : command.Impersonator.Identity.Name;
            activity.UpdatedOnUtc = DateTime.UtcNow;

            var values = activity.Values.SingleOrDefault(x => x.Mode == activity.Mode);
            if (values == null)
            {
                var copyValuesCommand = new CopyActivityValues(command.Principal)
                {
                    ActivityValuesId = activity.Values.Single(x => x.Mode != activity.Mode).RevisionId,
                    Mode = activity.Mode,
                    CopyToActivity = activity,
                    NoCommit = true,
                };
                _copyActivityValues.Handle(copyValuesCommand);
                values = copyValuesCommand.CreatedActivityValues;
            }
            else
            {
                values.UpdatedByPrincipal = command.Principal.Identity.Name;
                values.UpdatedOnUtc = DateTime.UtcNow;
            }

            values.Title = command.Title;
            values.Content = command.Content;
            values.StartsOn = command.StartsOn;
            values.EndsOn = command.EndsOn;
            values.StartsFormat = command.StartsOn.HasValue ? command.StartsFormat ?? "M/d/yyyy" : null;
            values.EndsFormat = command.EndsOn.HasValue ? command.EndsFormat ?? "M/d/yyyy" : null;
            values.OnGoing = command.OnGoing;
            values.WasExternallyFunded = command.WasExternallyFunded;
            values.WasInternallyFunded = command.WasInternallyFunded;

            _entities.SaveChanges();
        }
    }
}
