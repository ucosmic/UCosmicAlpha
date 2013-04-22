using System;
using System.Linq;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityType
    {
        public int ActivityValuesId { get; set; }
        public int EmployeeActivityTypeId { get; set; }
        public bool NoCommit { get; set; }

        public ActivityType CreatedActivityType { get; protected internal set; }
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

        public void Handle(CreateActivityType command)
        {
            if (command == null) throw new ArgumentNullException("command");

            ActivityValues activityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("ActivityValues Id '{0}' was not found.", command.ActivityValuesId));
            }

            EmployeeActivityType employeeActivityType = _entities.Get<EmployeeActivityType>().Single(x => x.Id == command.EmployeeActivityTypeId);
            if (employeeActivityType == null)
            {
                // TODO: check this in command validator
                throw new Exception(string.Format("EmployeeActivityType Id '{0}' was not found.", command.EmployeeActivityTypeId));
            }

            var activityType = new ActivityType
            {
                ActivityValuesId = activityValues.RevisionId,
                TypeId = employeeActivityType.Id,
            };

            command.CreatedActivityType = activityType;

            _entities.Create(activityType);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}

