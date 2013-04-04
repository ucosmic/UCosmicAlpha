using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Identity
{
    public class RolesGrantedToUserId : BaseEntitiesQuery<Role>, IDefineQuery<Role[]>
    {
        public RolesGrantedToUserId(IPrincipal principal, int userId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            UserId = userId;
        }

        public IPrincipal Principal { get; private set; }
        public int UserId { get; private set; }
    }

    public class ValidateRolesGrantedToUserIdQuery : AbstractValidator<RolesGrantedToUserId>
    {
        public ValidateRolesGrantedToUserIdQuery(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustBeInAnyRole(RoleName.UserManagers)
            ;

            // only authorization agents can get roles for any user
            When(x => !x.Principal.IsInRole(RoleName.AuthorizationAgent), () =>
                RuleFor(x => x.UserId)
                    .MustBeTenantUserId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantUserId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserId)
            );
        }
    }

    public class HandleRolesGrantedToUserIdQuery : IHandleQueries<RolesGrantedToUserId, Role[]>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleRolesGrantedToUserIdQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public Role[] Handle(RolesGrantedToUserId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new RolesUnfiltered(query.Principal)
            {
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            return internalQueryable
                .Where(x => x.Grants.Any(y => y.User.RevisionId == query.UserId))
                .ToArray()
            ;
        }
    }
}
