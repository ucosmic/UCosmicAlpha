using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustNotHaveEmptyPrincipalIdentityName : PropertyValidator
    {
        public const string FailMessage = "User principal must have non-empty identity name.";

        internal MustNotHaveEmptyPrincipalIdentityName()
            : base(FailMessage)
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            var value = (IPrincipal)context.PropertyValue;

            return !string.IsNullOrWhiteSpace(value.Identity.Name);
        }
    }

    public static class MustNotHaveEmptyPrincipalIdentityNameExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustNotHaveEmptyPrincipalIdentityName<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustNotHaveEmptyPrincipalIdentityName());
        }
    }
}
