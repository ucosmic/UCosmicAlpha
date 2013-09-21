using System;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public CreateActivityValues(IPrincipal principal, int activityId, ActivityMode mode)
        {
            Principal = principal;
            ActivityId = activityId;
            Mode = mode;
            DateFormat = ActivityValues.DefaultDateFormat;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public ActivityMode Mode { get; private set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string DateFormat { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        internal bool NoCommit { get; set; }
        public ActivityValues CreatedActivityValues { get; internal set; }
    }

    public class ValidateCreateActivityValuesCommand : AbstractValidator<CreateActivityValues>
    {
        public ValidateCreateActivityValuesCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                // commanding principal must own the activity
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;

            RuleFor(x => x.ActivityId)
                // activity id must exist in the database
                .MustFindActivityById(queryProcessor)
            ;

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
                DateFormat = command.DateFormat ?? ActivityValues.DefaultDateFormat,
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded,

                CreatedByPrincipal = command.Principal.Identity.Name,
            };

            _entities.Create(activityValues);

            if (!command.NoCommit)
            {
                _entities.SaveChanges();
            }

            command.CreatedActivityValues = activityValues;
        }
    }
}

