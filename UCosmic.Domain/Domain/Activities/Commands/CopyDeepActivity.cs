using System;
using System.Linq;
using FluentValidation;


namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivity
    {
        public int Id { get; protected set; }
        public ActivityMode Mode { get; protected set; }
        public int? EditSourceId { get; protected set; }
        public bool NoCommit { get; set; }
        public Activity CreatedActivity { get; set; }

        public CopyDeepActivity(int id, ActivityMode mode, int? editSourceId = null)
        {
            Id = id;
            Mode = mode;
            EditSourceId = editSourceId;
        }
    }

    public class ValidateCopyDeepActivityCommand : AbstractValidator<CopyDeepActivity>
    {
        public ValidateCopyDeepActivityCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Activity id", x => x.Id)

                // id must exist in the database
                .MustFindActivityById(entities)
                .WithMessage(MustFindActivityById.FailMessageFormat, x => x.Id);
        }
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
