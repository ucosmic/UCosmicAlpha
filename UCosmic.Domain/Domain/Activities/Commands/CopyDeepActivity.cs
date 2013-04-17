using System;
using System.Transactions;


namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivity
    {
        public int Id { get; protected set; }
        public ActivityMode Mode { get; protected set; }

        public Activity CreatedActivity { get; set; }
    }

    public class HandleCopyDeepActivityCommand : IHandleCommands<CopyDeepActivity>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CopyActivity> _copyActivity; 

        public HandleCopyDeepActivityCommand( ICommandEntities entities,
                                              IUnitOfWork unitOfWork,
                                              IHandleCommands<CopyActivity> copyActivity )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _copyActivity = copyActivity;
        }

        public void Handle(CopyDeepActivity command)
        {
            if (command == null) throw new ArgumentNullException("command");

            using (var transaction = new TransactionScope())
            {
                try
                {

                    /* ----- Copy Activity ----- */
                    //var copyActivityCommand = new CopyActivity
                    //{
                    //    Id = command.Id,
                    //    Mode = command.Mode
                    //};

                    //_copyActivity.Handle(copyActivityCommand);

                    //Activity activity = copyActivityCommand.CreatedActivity;

                    ///* ----- Copy Activity Values ----- */
                    //CopyDeepActivityValues copyDeepActivityValuesCommand = new CopyDeepActivityValues
                    //{
                    //    ActivityId = activity.RevisionId,
                    //    Mode = activity.Mode
                    //};

                    //_copyDeepActivityValues.Handle(copyDeepActivityValuesCommand);

                    //_unitOfWork.SaveChanges();
                    //command.CreatedActivity = activity;
                }
                catch (Exception ex)
                {

                }
            }
        }
    }
}
