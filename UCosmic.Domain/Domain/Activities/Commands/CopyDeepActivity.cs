using System;
using System.Linq;


namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivity
    {
        public int Id { get; set; }
        public ActivityMode Mode { get; set; }
        public int? EditSourceId { get; set; }
        public bool NoCommit { get; set; }
        public Activity CreatedActivity { get; set; }
    }

    public class HandleCopyDeepActivityCommand : IHandleCommands<CopyDeepActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CopyActivity> _copyActivity;
        private readonly IHandleCommands<CopyDeepActivityValues> _copyDeepActivityValues; 

        public HandleCopyDeepActivityCommand( ICommandEntities entities,
                                              IUnitOfWork unitOfWork,
                                              IHandleCommands<CopyActivity> copyActivity,
                                              IHandleCommands<CopyDeepActivityValues> copyDeepActivityValues )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _copyActivity = copyActivity;
            _copyDeepActivityValues = copyDeepActivityValues;
        }

        public void Handle(CopyDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var sourceActivity = _entities.Get<Activity>().SingleOrDefault(x => x.RevisionId == command.Id);
            if (sourceActivity == null)
            {
                var message = string.Format("Activity Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            /* ----- Copy Activity ----- */
            var copyActivityCommand = new CopyActivity
            {
                Id = sourceActivity.RevisionId,
                Mode = command.Mode,
                EditSourceId = command.EditSourceId,
                NoCommit = true
            };

            _copyActivity.Handle(copyActivityCommand);

            var activityCopy = copyActivityCommand.CreatedActivity;

            /* ----- Copy Activity Values ----- */
            var modeText = command.Mode.AsSentenceFragment();
            var activityValues = sourceActivity.Values.FirstOrDefault(x => x.ModeText == modeText);
            if (activityValues == null)
            {
                var message = string.Format("Cannot find ActivityValues Mode {0} for Activity Id {1}", modeText,
                                               sourceActivity.RevisionId);
                throw new Exception(message);
            }

            var copyDeepActivityValuesCommand = new CopyDeepActivityValues
            {
                ActivityId = activityCopy.RevisionId,
                Id = activityValues.RevisionId,
                Mode = activityCopy.Mode,
                NoCommit = true
            };

            _copyDeepActivityValues.Handle(copyDeepActivityValuesCommand);

            command.CreatedActivity = activityCopy;

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
