using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CopyActivityAndValues
    {
        public CopyActivityAndValues(IPrincipal principal, int activityId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            ActivityId = activityId;
        }

        public IPrincipal Principal { get; private set; }
        public int ActivityId { get; private set; }
        public Activity CreatedActivity { get; internal set; }
    }

    public class ValidateCopyActivityAndValuesCommand : AbstractValidator<CopyActivityAndValues>
    {
        public ValidateCopyActivityAndValuesCommand(IProcessQueries queryProcessor)
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

    public class HandleCopyActivityAndValuesCommand : IHandleCommands<CopyActivityAndValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CopyActivity> _copyActivity;
        private readonly IHandleCommands<CopyActivityValues> _copyActivityValues;
        private readonly IHandleCommands<MoveActivityDocuments> _moveActivityDocuments;

        public HandleCopyActivityAndValuesCommand(ICommandEntities entities
            , IHandleCommands<CopyActivity> copyActivity
            , IHandleCommands<CopyActivityValues> copyActivityValues
            , IHandleCommands<MoveActivityDocuments> moveActivityDocuments
        )
        {
            _entities = entities;
            _copyActivity = copyActivity;
            _copyActivityValues = copyActivityValues;
            _moveActivityDocuments = moveActivityDocuments;
        }

        public void Handle(CopyActivityAndValues command)
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
            var copyActivityValues = new CopyActivityValues(command.Principal)
            {
                CopyToActivity = copiedActivity,
                ActivityValuesId = originalValues.RevisionId,
                Mode = copiedActivity.Mode,
                NoCommit = true,
            };
            _copyActivityValues.Handle(copyActivityValues);
            command.CreatedActivity = copiedActivity;

            _entities.SaveChanges();

            // fix image paths now that there is a pk
            _moveActivityDocuments.Handle(new MoveActivityDocuments(command.CreatedActivity.RevisionId));
        }
    }
}
