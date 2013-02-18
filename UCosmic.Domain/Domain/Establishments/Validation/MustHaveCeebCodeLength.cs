using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustHaveCeebCodeLength : PropertyValidator
    {
        public const string FailMessage = "Both CEEB and UCosmic codes must be exactly 6 characters long.";

        internal MustHaveCeebCodeLength()
            : base(FailMessage) { }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (context.PropertyValue == null) return true;

            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;
            if (string.IsNullOrEmpty(value)) return true;

            return value.Length == 6;
        }
    }

    public static class MustHaveCeebCodeLengthExtensions
    {
        public static IRuleBuilderOptions<T, string> MustHaveCeebCodeLength<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustHaveCeebCodeLength());
        }
    }
}
