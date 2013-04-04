using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustNotRevokeOwnGrant<T> : PropertyValidator
    {
        public const string FailMessageFormat = "You cannot revoke your own '{0}' access grant.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;
        private readonly Func<T, int> _userId;
        private readonly string _roleName;

        internal MustNotRevokeOwnGrant(IProcessQueries queryProcessor, 
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
            var userId = _userId((T)context.Instance);

            var roleToRevoke = _queryProcessor.Execute(new RoleById(principal, value));
            var userToRevoke = _queryProcessor.Execute(new UserById(userId));
            if (_roleName.Equals(roleToRevoke.Name))
                return !principal.Identity.Name.Equals(userToRevoke.Name, StringComparison.OrdinalIgnoreCase);
            return true;
        }
    }

    public static class MustNotRevokeOwnGrantExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotRevokeOwnGrant<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, string roleName, 
            Func<T, IPrincipal> principal, Func<T, int> userId)
        {
            return ruleBuilder.SetValidator(new MustNotRevokeOwnGrant<T>(queryProcessor, roleName, principal, userId));
        }
    }
}
