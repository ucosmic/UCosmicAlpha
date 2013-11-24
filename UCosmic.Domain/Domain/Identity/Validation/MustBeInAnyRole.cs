using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeInAnyRole : PropertyValidator
    {
        private const string FailMessageFormat = "User '{UserName}' is not authorized to perform the '{CommandName}' action.";

        private readonly string[] _roles;

        internal MustBeInAnyRole(string[] roles)
            : base(FailMessageFormat)
        {
            if (roles == null) throw new ArgumentNullException("roles");
            _roles = roles;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var principal = (IPrincipal)context.PropertyValue;

            var isInAnyRole = principal.IsInAnyRole(_roles);

            if (!isInAnyRole)
            {
                context.MessageFormatter.AppendArgument("UserName", principal.Identity.Name);
                context.MessageFormatter.AppendArgument("CommandName", context.Instance.GetType().Name);
            }

            return isInAnyRole;
        }
    }

    public static class MustBeInAnyRoleExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustBeInAnyRole<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, params string[] roles)
        {
            return ruleBuilder.SetValidator(new MustBeInAnyRole(roles));
        }
    }
}
