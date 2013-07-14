using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustNotHaveEmptyIdentityName : PropertyValidator
    {
        public const string FailMessage = "User principal must have non-empty identity name.";

        internal MustNotHaveEmptyIdentityName()
            : base(FailMessage)
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            var principal = (IPrincipal)context.PropertyValue;

            return !string.IsNullOrWhiteSpace(principal.Identity.Name);
        }
    }

    public static class MustNotHaveEmptyIdentityNameExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustNotHaveEmptyIdentityName<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustNotHaveEmptyIdentityName());
        }
    }
}
