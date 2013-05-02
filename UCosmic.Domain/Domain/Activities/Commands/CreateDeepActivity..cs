using System;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CreateDeepActivity
    {
        public IPrincipal Principal { get; protected set; }
        public string ModeText { get; protected set; }
        public Guid? EntityId { get; set; }
        public int? EditSourceId { get; set; }
        public Activity CreatedActivity { get; internal set; }
        public bool NoCommit { get; set; }

        public CreateDeepActivity(IPrincipal principal, string modeText)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (modeText == null) throw new ArgumentNullException("modeText");
            Principal = principal;
            ModeText = modeText;
        }
    }

    public class HandleCreateDeepActivityCommand : IHandleCommands<CreateDeepActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateMyNewActivity> _createMyNewActivity;
        private readonly IHandleCommands<CreateDeepActivityValues> _createActivityValuesDeep;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateDeepActivityCommand(ICommandEntities entities,
                                               IUnitOfWork unitOfWork,
                                               IHandleCommands<CreateMyNewActivity> createMyNewActivity,
                                               IHandleCommands<CreateDeepActivityValues> createActivityValuesDeep)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createMyNewActivity = createMyNewActivity;
            _createActivityValuesDeep = createActivityValuesDeep;
        }

        public void Handle(CreateDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var createMyNewActivityCommand = new CreateMyNewActivity(command.Principal,
                                                                     command.ModeText);
            _createMyNewActivity.Handle(createMyNewActivityCommand);

            var activity = createMyNewActivityCommand.CreatedActivity;

            var createActivityValuesDeepCommand = new CreateDeepActivityValues(command.Principal,
                                                                               activity.RevisionId,
                                                                               activity.Mode);
            _createActivityValuesDeep.Handle(createActivityValuesDeepCommand);


            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedActivity = activity;
        }
    }
}
