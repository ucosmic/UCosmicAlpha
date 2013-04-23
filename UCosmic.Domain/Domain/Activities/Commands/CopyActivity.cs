using System;
using System.Linq;


namespace UCosmic.Domain.Activities
{
    public class CopyActivity
    {
        public int Id { get; set; }
        public ActivityMode Mode { get; set; }
        public int? EditSourceId { get; set; }
        public bool NoCommit { get; set; }
        public Activity CreatedActivity { get; set; }
    }

    public class HandleCopyActivityCommand : IHandleCommands<CopyActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateMyNewActivity> _createActivity;

        public HandleCopyActivityCommand(ICommandEntities entities,
                                          IUnitOfWork unitOfWork,
                                          IHandleCommands<CreateMyNewActivity> createActivity)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createActivity = createActivity;
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

            var createActivityCommand = new CreateMyNewActivity(sourceActivity.Person.User,
                                                                command.Mode.AsSentenceFragment())
            {
                EditSourceId = command.EditSourceId
            };

            _createActivity.Handle(createActivityCommand);

            command.CreatedActivity = createActivityCommand.CreatedActivity;

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
