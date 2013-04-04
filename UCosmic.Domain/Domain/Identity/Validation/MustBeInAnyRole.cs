using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeInAnyRole : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to perform the '{1}' action.";

        private readonly string[] _roles;

        internal MustBeInAnyRole(string[] roles)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (roles == null) throw new ArgumentNullException("roles");
            _roles = roles;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (IPrincipal)context.PropertyValue;

            return value.IsInAnyRole(_roles);
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
