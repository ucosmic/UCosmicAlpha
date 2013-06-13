using System;
using FluentValidation;

namespace UCosmic.Domain.External
{
    public class CreateServiceSync
    {
        public CreateServiceSync()
        {
        }

        public string Name { get; set; }
        public DateTime? ExternalSyncDate { get; set; }
        public DateTime? LastUpdateAttempt { get; set; }
        public int? UpdateFailCount { get; set; }
        public string LastUpdateResult { get; set; } /* success, inprogress, failed */
        public string ServiceUsername { get; set; }
        public string ServicePassword { get; set; }

        public ServiceSync CreatedServiceSync { get; internal set; }
    }

    public class ValidateCreateServiceSyncCommand : AbstractValidator<CreateServiceSync>
    {
        public ValidateCreateServiceSyncCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateServiceSyncCommand : IHandleCommands<CreateServiceSync>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateServiceSyncCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateServiceSync command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var serviceSync = new ServiceSync
            {
                Name = command.Name,
                ExternalSyncDate = command.ExternalSyncDate,
                LastUpdateAttempt = command.LastUpdateAttempt,
                UpdateFailCount = command.UpdateFailCount,
                LastUpdateResult = command.LastUpdateResult,
                ServiceUsername = command.ServiceUsername,
                ServicePassword = command.ServicePassword
            };

            _entities.Create(serviceSync);

            command.CreatedServiceSync = serviceSync;
        }
    }
}
