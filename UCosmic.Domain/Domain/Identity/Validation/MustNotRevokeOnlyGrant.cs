using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustNotRevokeOnlyGrant<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The only '{0}' access grant cannot be revoked.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;
        private readonly Func<T, int> _userId;
        private readonly string _roleName;

        internal MustNotRevokeOnlyGrant(IProcessQueries queryProcessor, 
            string roleName, Func<T, IPrincipal> principal, Func<T, int> userId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (string.IsNullOrWhiteSpace(roleName))
                throw new ArgumentException("Cannot be null, empty, or whitespace.", "roleName");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _roleName = roleName;
            _principal = principal;
            _userId = userId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", _roleName);
            var value = (int)context.PropertyValue;
            var principal = _principal((T)context.Instance);
            var userId = _userId != null ? _userId((T)context.Instance) : (int?)null;

            var eagerLoad = !userId.HasValue
                ? new Expression<Func<Role, object>>[] { x => x.Grants.Select(y => y.User), } : null;
            var roleToRevoke = _queryProcessor.Execute(new RoleById(principal, value) { EagerLoad = eagerLoad });
            if (!_roleName.Equals(roleToRevoke.Name)) return true;

            if (!userId.HasValue) return roleToRevoke.Grants.Count > 1;

            var userToRevoke = _queryProcessor.Execute(new UserById(userId.Value));
            var perTenantPrincipal = new GenericPrincipal(new GenericIdentity(userToRevoke.Name),
                new[] { RoleName.SecurityAdministrator });
            var tenantUsers = _queryProcessor.Execute(new MyUsers(perTenantPrincipal));
            var tenantSecurityAdmins = tenantUsers.Where(x => x.Grants.Any(y =>
                y.Role.Name.Equals(RoleName.SecurityAdministrator, StringComparison.OrdinalIgnoreCase)));
            return tenantSecurityAdmins.Count() > 1;
        }
    }

    public static class MustNotRevokeOnlyGrantExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotRevokeOnlyGrant<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, string roleName, 
            Func<T, IPrincipal> principal, Func<T, int> userId = null)
        {
            return ruleBuilder.SetValidator(new MustNotRevokeOnlyGrant<T>(queryProcessor, roleName, principal, userId));
        }
    }
}
