using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityValues
    {
        public IPrincipal  Principal { get; protected set;  }
        public int ActivityId { get; protected set; }
        public ActivityMode Mode { get; protected set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string DateFormat { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public bool NoCommit { get; set; }
        public ActivityValues CreatedActivityValues { get; protected internal set; }

        public CreateActivityValues(IPrincipal principal, int activityId, ActivityMode mode)
        {
            Principal = principal;
            ActivityId = activityId;
            Mode = mode;
            DateFormat = "MM/dd/yyyy";
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
                OnGoing = command.OnGoing,
                DateFormat = command.DateFormat ?? "MM/dd/yyyy",
                Mode = command.Mode,
                WasExternallyFunded = command.WasExternallyFunded,
                WasInternallyFunded = command.WasInternallyFunded,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
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

