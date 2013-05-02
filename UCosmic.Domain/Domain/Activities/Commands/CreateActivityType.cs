using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityType
    {
        public IPrincipal Principal { get; protected set; }
        public int ActivityValuesId { get; protected set; }
        public int EmployeeActivityTypeId { get; protected set; }
        public bool NoCommit { get; set; }
        public ActivityType CreatedActivityType { get; protected internal set; }

        public CreateActivityType(IPrincipal principal, int activityValuesId, int employeeActivityTypeId)
        {
            Principal = principal;
            ActivityValuesId = activityValuesId;
            EmployeeActivityTypeId = employeeActivityTypeId;
        }
    }

    public class HandleCreateActivityTypeCommand : IHandleCommands<CreateActivityType>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateActivityTypeCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public class ValidateCreateActivityTypeCommand : AbstractValidator<CreateActivityType>
        {
            public ValidateCreateActivityTypeCommand(IQueryEntities entities)
            {
                CascadeMode = CascadeMode.StopOnFirstFailure;

                RuleFor(x => x.ActivityValuesId)
                    // activity values id must be within valid range
                    .GreaterThanOrEqualTo(1)
                        .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "ActivityValues id", x => x.ActivityValuesId)

                    // activity values id must exist in the database
                    .MustFindActivityValuesById(entities)
                        .WithMessage(MustFindActivityValuesById.FailMessageFormat, x => x.ActivityValuesId)
                ;

                RuleFor(x => x.EmployeeActivityTypeId)
                    // type id must be within valid range
                    .GreaterThanOrEqualTo(1)
                        .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "EmployeeActivityType id", x => x.EmployeeActivityTypeId)

                    // activity values id must exist in the database
                    .MustFindEmployeeActivityTypeById(entities)
                        .WithMessage(MustFindEmployeeActivityTypeById.FailMessageFormat, x => x.EmployeeActivityTypeId)
                ;
            }
        }

        public void Handle(CreateActivityType command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activityValues = _entities.Get<ActivityValues>()
                .Single(x => x.RevisionId == command.ActivityValuesId);

            var employeeActivityType = _entities.Get<EmployeeActivityType>()
                .Single(x => x.Id == command.EmployeeActivityTypeId);

            var activityType = new ActivityType
            {
                ActivityValuesId = activityValues.RevisionId,
                TypeId = employeeActivityType.Id,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };


            _entities.Create(activityType);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedActivityType = activityType;
        }
    }
}

