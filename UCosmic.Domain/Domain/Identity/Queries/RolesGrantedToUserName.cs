using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Identity
{
    public class RolesGrantedToUserName : BaseEntitiesQuery<Role>, IDefineQuery<Role[]>
    {
        public RolesGrantedToUserName(IPrincipal principal, string userName)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (string.IsNullOrWhiteSpace(userName))
                throw new ArgumentException("User name cannot be null or whitespace.", "userName");

            Principal = principal;
            UserName = userName;
        }

        public IPrincipal Principal { get; private set; }
        public string UserName { get; private set; }
    }

    public class ValidateRolesGrantedToUserNameQuery : AbstractValidator<RolesGrantedToUserName>
    {
        public ValidateRolesGrantedToUserNameQuery(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // non user managers can only get their own role info
            When(x => !x.Principal.IsInAnyRole(RoleName.UserManagers), () =>
                RuleFor(x => x.UserName)
                    .Equal(x => x.Principal.Identity.Name, StringComparer.OrdinalIgnoreCase)
                        .WithMessage(MustBeTenantUserName<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserName)
            );

            // only authorization agents can get roles for any user
            When(x => !x.Principal.IsInRole(RoleName.AuthorizationAgent), () =>
                RuleFor(x => x.UserName)
                    .MustBeTenantUserName(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantUserName<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.UserName)
            );
        }
    }

    public class HandleRolesGrantedToUserNameQuery : IHandleQueries<RolesGrantedToUserName, Role[]>
    {
        private readonly IProcessQueries _queryProcessor;

        public HandleRolesGrantedToUserNameQuery(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        public Role[] Handle(RolesGrantedToUserName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var internalQuery = new RolesUnfiltered(query.Principal)
            {
                EagerLoad = query.EagerLoad,
                OrderBy = query.OrderBy,
            };

            var internalQueryable = _queryProcessor.Execute(internalQuery);

            return internalQueryable
                .Where(x => x.Grants.Any(y => y.User.Name.Equals(query.UserName, StringComparison.OrdinalIgnoreCase)))
                .ToArray()
            ;
        }
    }
}
