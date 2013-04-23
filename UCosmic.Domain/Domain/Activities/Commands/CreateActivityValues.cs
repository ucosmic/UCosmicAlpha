using System;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public int ActivityId { get; protected set; }
        public ActivityMode Mode { get; protected set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public bool NoCommit { get; set; }
        public ActivityValues CreatedActivityValues { get; protected internal set; }

        public CreateActivityValues(int activityId, ActivityMode mode)
        {
            ActivityId = activityId;
            Mode = mode;
        }
    }

    public class ValidateCreateActivityValuesCommand : AbstractValidator<CreateActivityValues>
    {
        public ValidateCreateActivityValuesCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                // activity id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Activity id", x => x.ActivityId)

                // activity id must exist in the database
                .MustFindActivityById(entities)
                    .WithMessage(MustFindActivityById.FailMessageFormat, x => x.ActivityId)
            ;
        }
    }

    public class HandleCreateActivityValuesCommand : IHandleCommands<CreateActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateActivityValuesCommand(ICommandEntities entities,
                                                 IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
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
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded
            };

            _entities.Create(activityValues);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedActivityValues = activityValues;
        }
    }
}

