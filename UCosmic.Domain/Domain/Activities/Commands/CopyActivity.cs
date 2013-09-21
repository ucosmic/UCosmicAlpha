using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Activities
{
    public class CopyActivity
    {
        internal CopyActivity(IPrincipal principal)
        {
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
        internal int ActivityId { get; set; }
        internal ActivityMode Mode { get; set; }
        internal int? EditSourceId { get; set; }
        internal bool NoCommit { get; set; }
        internal Activity CreatedActivity { get; set; }
    }

    public class HandleCopyActivityCommand : IHandleCommands<CopyActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateMyNewActivity> _createActivity;

        public HandleCopyActivityCommand(ICommandEntities entities, IHandleCommands<CreateMyNewActivity> createActivity)
        {
            _entities = entities;
            _createActivity = createActivity;
        }

        public void Handle(CopyActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var sourceActivity = _entities.Get<Activity>().Single(x => x.RevisionId == command.ActivityId);
            if (sourceActivity == null)
            {
                var message = string.Format("Activity Id {0} not found.", command.ActivityId);
                throw new Exception(message);
            }

            var createActivityCommand = new CreateMyNewActivity( command.Principal,  
                                                                 command.Mode.AsSentenceFragment())
            {
                EditSourceId = command.EditSourceId
            };

            _createActivity.Handle(createActivityCommand);

            command.CreatedActivity = createActivityCommand.CreatedActivity;

            if (!command.NoCommit)
            {
                _entities.SaveChanges();

                //_eventProcessor.Raise(new ActivityCreated
                //{
                //    ActivityId = command.CreatedActivity.RevisionId,
                //});
            }
        }
    }
}
