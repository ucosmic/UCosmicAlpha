using System;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public CreateActivityValues(IPrincipal principal)
        {
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        internal bool NoCommit { get; set; }
        internal Activity Activity { get; set; }
        public ActivityValues CreatedActivityValues { get; internal set; }
    }

    public class ValidateCreateActivityValuesCommand : AbstractValidator<CreateActivityValues>
    {
        public ValidateCreateActivityValuesCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // when an activityId is used instead of an activity
            When(x => x.Activity == null, () =>
            {
                RuleFor(x => x.ActivityId)
                    // activity id must exist in the database
                    .MustFindActivityById(queryProcessor)
                ;

                RuleFor(x => x.Principal)
                    // commanding principal must own the activity
                    .MustOwnActivity(queryProcessor, x => x.ActivityId)
                ;
            });

            // when an activity is used instead of an activityId
            When(x => x.Activity != null, () =>
                RuleFor(x => x.Principal)
                    // commanding principal must own the activity
                    .MustOwnActivity(queryProcessor, x => x.Activity)
            );

            RuleFor(x => x.Title)
                .Length(0, ActivityValuesConstraints.TitleMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat, x => "Title", x => ActivityValuesConstraints.TitleMaxLength, x => x.Title.Length)
            ;
        }
    }

    public class HandleCreateActivityValuesCommand : IHandleCommands<CreateActivityValues>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityValuesCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityValues = new ActivityValues
            {
                ActivityId = command.ActivityId,
                Title = command.Title,
                Content = command.Content,
                StartsOn = command.StartsOn,
                EndsOn = command.EndsOn,
                OnGoing = command.OnGoing,
                StartsFormat = command.StartsOn.HasValue ? command.StartsFormat ?? "M/d/yyyy" : null,
                EndsFormat = command.EndsOn.HasValue ? command.EndsFormat ?? "M/d/yyyy" : null,
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded,

                CreatedByPrincipal = command.Principal.Identity.Name,
            };

            _entities.Create(activityValues);

            command.CreatedActivityValues = activityValues;

            if (!command.NoCommit) _entities.SaveChanges();
        }
    }
}

