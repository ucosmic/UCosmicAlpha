using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivity
    {
        public CopyDeepActivity(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
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

                // must have activity values for activity's mode
                .MustHaveValuesForMode(queryProcessor)
            ;

            RuleFor(x => x.Principal)
                .MustFindUserByPrincipal(queryProcessor)
                .MustOwnActivity(queryProcessor, x => x.ActivityId)
            ;
        }
    }

    public class HandleCopyDeepActivityCommand : IHandleCommands<CopyDeepActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CopyActivity> _copyActivity;
        private readonly IHandleCommands<CopyDeepActivityValues> _copyDeepActivityValues;
        private readonly IHandleCommands<MoveActivityDocuments> _moveActivityDocuments;

        public HandleCopyDeepActivityCommand(ICommandEntities entities
            , IHandleCommands<CopyActivity> copyActivity
            , IHandleCommands<CopyDeepActivityValues> copyDeepActivityValues
            , IHandleCommands<MoveActivityDocuments> moveActivityDocuments
        )
        {
            _entities = entities;
            _copyActivity = copyActivity;
            _copyDeepActivityValues = copyDeepActivityValues;
            _moveActivityDocuments = moveActivityDocuments;
        }

        public void Handle(CopyDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var originalActivity = _entities.Get<Activity>().ById(command.ActivityId, false);

            /* ----- Copy Activity ----- */
            var copyActivity = new CopyActivity(command.Principal)
            {
                ActivityId = command.ActivityId,
                Mode = originalActivity.Mode,
                NoCommit = true,
            };
            _copyActivity.Handle(copyActivity);
            var copiedActivity = copyActivity.CreatedActivity;

            /* ----- Copy Activity Values ----- */
            var modeText = originalActivity.Mode.AsSentenceFragment();
            var originalValues = originalActivity.Values.First(x => x.ModeText == modeText);
            var copyDeepActivityValuesCommand = new CopyDeepActivityValues(command.Principal)
            {
                CopyToActivity = copiedActivity,
                ActivityValuesId = originalValues.RevisionId,
                Mode = copiedActivity.Mode,
                NoCommit = true,
            };
            _copyDeepActivityValues.Handle(copyDeepActivityValuesCommand);
            command.CreatedActivity = copiedActivity;

            _entities.SaveChanges();

            // fix image paths now that there is a pk
            _moveActivityDocuments.Handle(new MoveActivityDocuments(command.CreatedActivity.RevisionId));
        }
    }
}
