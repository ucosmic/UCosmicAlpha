using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustHaveAgreementVisibility : PropertyValidator
    {
        public const string RequiredFailMessage = "Agreement visibility is required and must be one of 'Public', 'Protected', or 'Private'.";
        public const string EnumFailMessage = "Agreement visibility must be one of 'Public', 'Protected', or 'Private'.";
        public const string FileFailMessage = "Agreement file visibility must be one of 'Public', 'Protected', or 'Private'.";

        internal MustHaveAgreementVisibility()
            : base(EnumFailMessage)
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;
            if (value == null) return false;

            return AgreementVisibility.Public.AsSentenceFragment().Equals(value, StringComparison.OrdinalIgnoreCase)
                || AgreementVisibility.Protected.AsSentenceFragment().Equals(value, StringComparison.OrdinalIgnoreCase)
                || AgreementVisibility.Private.AsSentenceFragment().Equals(value, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustHaveAgreementVisibilityExtensions
    {
        public static IRuleBuilderOptions<T, string> MustHaveAgreementVisibility<T>
            (this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustHaveAgreementVisibility());
        }
    }
}
