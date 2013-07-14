using System;
using System.Linq;

namespace UCosmic.Domain.Identity
{
    public class EnsureUserTenancy
    {
        internal EnsureUserTenancy(string userName)
        {
            UserName = userName;
        }

        internal string UserName { get; private set; }
        internal User EnsuredUser { get; set; }
    }

    public class HandleEnsureUserTenancyCommand : IHandleCommands<EnsureUserTenancy>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleEnsureUserTenancyCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(EnsureUserTenancy command)
        {
            if (command == null) throw new ArgumentNullException("command");

            command.EnsuredUser = _entities.Get<User>().SingleOrDefault(x => x.Name.Equals(command.UserName));
            if (command.EnsuredUser == null || command.EnsuredUser.TenantId.HasValue) return;

            if (command.EnsuredUser.Person.DefaultAffiliation == null) return;

            command.EnsuredUser.TenantId = command.EnsuredUser.Person.DefaultAffiliation.EstablishmentId;
            _unitOfWork.SaveChanges();
        }
    }
}
