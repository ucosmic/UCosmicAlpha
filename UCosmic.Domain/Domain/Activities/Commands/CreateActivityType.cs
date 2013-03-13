using System;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Activities
{
    public class CreateActivityType
    {
        public int ActivityValuesId { get; set; }
        public int EmployeeActivityTypeId { get; set; }

        public ActivityType CreatedActivityType { get; protected internal set; }
    }

    public class HandleCreateActivityTypeCommand : IHandleCommands<CreateActivityType>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateActivityTypeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateActivityType command)
        {
            if (command == null) throw new ArgumentNullException("command");

            ActivityValues activityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.ActivityValuesId);
            if (activityValues == null) { throw new Exception("ActivityValues Id " + command.ActivityValuesId.ToString() + " was not found."); }

            EmployeeActivityType employeeActivityType = _entities.Get<EmployeeActivityType>().Single(x => x.Id == command.EmployeeActivityTypeId);
            if (employeeActivityType == null) { throw new Exception("EmployeeActivityType Id " + command.EmployeeActivityTypeId.ToString() + " was not found."); }

            var activityType = new ActivityType
            {
                ActivityValuesId = activityValues.RevisionId,
                TypeId = employeeActivityType.Id,
            };

            _entities.Create(activityType);

            command.CreatedActivityType = activityType;
        }
    }
}

