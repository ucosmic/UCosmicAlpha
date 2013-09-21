using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivity
    {
        public CopyDeepActivity(IPrincipal principal, int activityId, ActivityMode mode)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
            Mode = mode;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public ActivityMode Mode { get; private set; }

        public Activity CreatedActivity { get; internal set; }
    }

    public class ValidateCopyDeepActivityCommand : AbstractValidator<CopyDeepActivity>
    {
        public ValidateCopyDeepActivityCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.ActivityId)
                // id must exist in the database
                .MustFindActivityById(queryProcessor)
            ;
        }
    }

    public class HandleCopyDeepActivityCommand : IHandleCommands<CopyDeepActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CopyActivity> _copyActivity;
        private readonly IHandleCommands<CopyDeepActivityValues> _copyDeepActivityValues;

        public HandleCopyDeepActivityCommand(ICommandEntities entities
            , IHandleCommands<CopyActivity> copyActivity
            , IHandleCommands<CopyDeepActivityValues> copyDeepActivityValues
        )
        {
            _entities = entities;
            _copyActivity = copyActivity;
            _copyDeepActivityValues = copyDeepActivityValues;
        }

        public void Handle(CopyDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var sourceActivity = _entities.Get<Activity>().ById(command.ActivityId, false);

            /* ----- Copy Activity ----- */
            var copyActivityCommand = new CopyActivity(command.Principal)
            {
                ActivityId = sourceActivity.RevisionId,
                Mode = command.Mode,
                EditSourceId = command.ActivityId,
                NoCommit = true,
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

            var copyDeepActivityValuesCommand = new CopyDeepActivityValues(command.Principal)
            {
                ActivityId = activityCopy.RevisionId,
                Id = activityValues.RevisionId,
                Mode = activityCopy.Mode,
                NoCommit = true
            };

            _copyDeepActivityValues.Handle(copyDeepActivityValuesCommand);

            command.CreatedActivity = activityCopy;

            //if (!command.NoCommit)
            //{
                _entities.SaveChanges();

                //_eventProcessor.Raise(new ActivityCreated
                //{
                //    ActivityId = command.CreatedActivity.RevisionId
                //});

            //}
        }
    }
}
