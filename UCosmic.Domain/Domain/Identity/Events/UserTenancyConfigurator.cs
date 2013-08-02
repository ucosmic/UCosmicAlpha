using System;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Identity
{
    public class UserTenancyConfigurator : IHandleEvents<ApplicationStarted>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public UserTenancyConfigurator(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(ApplicationStarted @event)
        {
            if (@event == null) throw new ArgumentNullException("event");

            var users = _entities.Get<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations,
                })
                .Where(x => !x.TenantId.HasValue && x.Person.Affiliations.Any(y => y.IsDefault)).ToArray();
            if (!users.Any()) return;

            foreach (var user in users)
            {
                var defaultAffiliation = user.Person.Affiliations.SingleOrDefault(x => x.IsDefault);
                if (defaultAffiliation != null)
                {
                    user.TenantId = defaultAffiliation.EstablishmentId;
                }
            }
            _unitOfWork.SaveChanges();
        }
    }
}