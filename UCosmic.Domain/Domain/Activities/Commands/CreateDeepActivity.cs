using System;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class CreateDeepActivity
    {
        public IPrincipal Principal { get; protected set; }
        public string ModeText { get; protected set; }
        public Guid? EntityId { get; set; }
        public int? EditSourceId { get; set; }
        public Activity CreatedActivity { get; internal set; }
        internal bool NoCommit { get; set; }

        public CreateDeepActivity(IPrincipal principal, string modeText)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (modeText == null) throw new ArgumentNullException("modeText");
            Principal = principal;
            ModeText = modeText;
        }
    }

    // TODO: needs validator, and use mode instead of modetext

    public class HandleCreateDeepActivityCommand : IHandleCommands<CreateDeepActivity>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateMyNewActivity> _createMyNewActivity;
        private readonly IHandleCommands<CreateDeepActivityValues> _createActivityValuesDeep;

        public HandleCreateDeepActivityCommand(IUnitOfWork unitOfWork
            , IHandleCommands<CreateMyNewActivity> createMyNewActivity
            , IHandleCommands<CreateDeepActivityValues> createActivityValuesDeep
        )
        {
            _unitOfWork = unitOfWork;
            _createMyNewActivity = createMyNewActivity;
            _createActivityValuesDeep = createActivityValuesDeep;
        }

        public void Handle(CreateDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Need this to commit in order to have RevisionId. */
            var createMyNewActivityCommand = new CreateMyNewActivity(command.Principal)
            {
                //NoEvents = true,
                Mode = command.ModeText.AsEnum<ActivityMode>(),
            };

            _createMyNewActivity.Handle(createMyNewActivityCommand);

            var activity = createMyNewActivityCommand.CreatedActivity;

            var createActivityValuesDeepCommand = new CreateDeepActivityValues(command.Principal,
                                                                               activity.RevisionId,
                                                                               activity.Mode);
            _createActivityValuesDeep.Handle(createActivityValuesDeepCommand);

            command.CreatedActivity = activity;

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();

                //_eventProcessor.Raise(new ActivityCreated
                //{
                //    ActivityId = command.CreatedActivity.RevisionId
                //});
            }
        }
    }
}
