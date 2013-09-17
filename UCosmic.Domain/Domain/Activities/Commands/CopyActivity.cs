using System;
using System.Linq;
using System.Security.Principal;


namespace UCosmic.Domain.Activities
{
    public class CopyActivity
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; set; }
        public ActivityMode Mode { get; set; }
        public int? EditSourceId { get; set; }
        public bool NoCommit { get; set; }
        public Activity CreatedActivity { get; set; }

        public CopyActivity(IPrincipal principal)
        {
            Principal = principal;
        }
    }

    public class HandleCopyActivityCommand : IHandleCommands<CopyActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateMyNewActivity> _createActivity;
        private readonly IProcessEvents _eventProcessor;

        public HandleCopyActivityCommand( ICommandEntities entities,
                                          IUnitOfWork unitOfWork,
                                          IHandleCommands<CreateMyNewActivity> createActivity,
                                          IProcessEvents eventProcessor)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createActivity = createActivity;
            _eventProcessor = eventProcessor;
        }

        public void Handle(CopyActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var sourceActivity = _entities.Get<Activity>().Single(x => x.RevisionId == command.Id);
            if (sourceActivity == null)
            {
                var message = string.Format("Activity Id {0} not found.", command.Id);
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
                _unitOfWork.SaveChanges();

                //_eventProcessor.Raise(new ActivityCreated
                //{
                //    ActivityId = command.CreatedActivity.RevisionId,
                //});
            }
        }
    }
}
