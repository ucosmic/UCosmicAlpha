using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustHaveActivityMode : PropertyValidator
    {
        public const string FailMessage = "Activity mode must be one of 'Public', 'Protected', or 'Private'.";

        internal MustHaveActivityMode()
            : base(FailMessage)
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;
            if (value == null) return false;

            return ActivityMode.Public.AsSentenceFragment().Equals(value)
                || ActivityMode.Draft.AsSentenceFragment().Equals(value);
        }
    }

    public static class MustHaveActivityModeExtensions
    {
        public static IRuleBuilderOptions<T, string> MustHaveActivityMode<T>
            (this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustHaveActivityMode());
        }
    }
}
