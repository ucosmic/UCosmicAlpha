using System;
using System.Linq;
using FluentValidation;

namespace UCosmic.Domain.External
{
    public class UpdateServiceSync
    {
        public int Id { get; protected set; }
        public string Name { get; set; }
        public DateTime? ExternalSyncDate { get; set; }
        public DateTime? LastUpdateAttempt { get; set; }
        public int? UpdateFailCount { get; set; }
        public string LastUpdateResult { get; set; } /* success, inprogress, failed */
        public string ServiceUsername { get; set; }
        public string ServicePassword { get; set; }

        internal bool NoCommit { get; set; }

        public UpdateServiceSync(int id)
        {
            Id = id;
        }
    }

    public class ValidateUpdateServiceSyncCommand : AbstractValidator<UpdateServiceSync>
    {
        public ValidateUpdateServiceSyncCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleUpdateServiceSyncCommand : IHandleCommands<UpdateServiceSync>
    {
        private readonly ICommandEntities _entities;
        //private readonly IQueryEntities _query;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateServiceSyncCommand( ICommandEntities entities
            //, IQueryEntities query
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            //_query = query;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateServiceSync command)
        {
            if (command == null)
            {
                throw new ArgumentNullException("command");
            }

            //var settings = _query.Query<ServiceSync>().SingleOrDefault(p => p.Id == command.Id);
            var settings = _entities.Get<ServiceSync>().SingleOrDefault(p => p.Id == command.Id);
            if (settings == null)
            {
                throw new InvalidOperationException(string.Format(
                    "ServiceSync '{0}' does not exist", command.Id));
            }

            if (command.Name != null)
            {
                settings.Name = command.Name;
            }
            if (command.ExternalSyncDate.HasValue)
            {
                settings.ExternalSyncDate = command.ExternalSyncDate.Value;
            }
            if (command.LastUpdateAttempt.HasValue)
            {
                settings.LastUpdateAttempt = command.LastUpdateAttempt.Value;
            }
            if (command.UpdateFailCount.HasValue)
            {
                settings.UpdateFailCount = command.UpdateFailCount.Value;
            }
            if (command.LastUpdateResult != null)
            {
                settings.LastUpdateResult = command.LastUpdateResult;
            }
            if (command.ServiceUsername != null)
            {
                settings.ServiceUsername = command.ServiceUsername;
            }
            if (command.ServicePassword != null)
            {
                settings.ServicePassword = command.ServicePassword;
            }

            _entities.Update(settings);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
