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

                // must have activity values for given mode
                .MustHaveValuesForMode(queryProcessor, x => x.Mode)
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

            var originalActivity = _entities.Get<Activity>().ById(command.ActivityId, false);

            /* ----- Copy Activity ----- */
            var copyActivityCommand = new CopyActivity(command.Principal)
            {
                ActivityId = command.ActivityId,
                Mode = command.Mode,
                NoCommit = true,
            };
            _copyActivity.Handle(copyActivityCommand);
            var copiedActivity = copyActivityCommand.CreatedActivity;

            /* ----- Copy Activity Values ----- */
            var modeText = command.Mode.AsSentenceFragment();
            var originalValues = originalActivity.Values.First(x => x.ModeText == modeText);
            var copyDeepActivityValuesCommand = new CopyDeepActivityValues(command.Principal)
            {
                ActivityId = copiedActivity.RevisionId,
                Id = originalValues.RevisionId,
                Mode = copiedActivity.Mode,
                NoCommit = true,
            };
            _copyDeepActivityValues.Handle(copyDeepActivityValuesCommand);
            command.CreatedActivity = copiedActivity;

            _entities.SaveChanges();
        }
    }
}
