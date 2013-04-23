using System;
using System.Linq;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class CreateDeepActivityValues
    {
        public int ActivityId { get; protected set; }
        public ActivityMode Mode { get; protected set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public ActivityValues CreatedActivityValues { get; protected internal set; }
        public bool NoCommit { get; set; }

        public CreateDeepActivityValues(int activityId, ActivityMode mode)
        {
            ActivityId = activityId;
            Mode = mode;
        }
    }

    public class HandleCreateDeepActivityValuesCommand : IHandleCommands<CreateDeepActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateActivityValues> _createActivityValues;

        public HandleCreateDeepActivityValuesCommand(ICommandEntities c,
                                                     IHandleCommands<CreateActivityValues> createActivityValues )
        {
            _createActivityValues = createActivityValues;
        }

        public void Handle(CreateDeepActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var createActivityValuesCommand = new CreateActivityValues(command.ActivityId, command.Mode);
            _createActivityValues.Handle(createActivityValuesCommand);

            command.CreatedActivityValues = createActivityValuesCommand.CreatedActivityValues;
        }
    }
}

