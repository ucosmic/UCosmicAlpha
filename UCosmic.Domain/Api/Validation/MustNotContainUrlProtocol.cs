using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic
{
    public class MustNotContainUrlProtocol : PropertyValidator
    {
        public const string FailMessage = "Please enter a URL without the protocol (http:// or https://).";

        internal MustNotContainUrlProtocol()
            : base(FailMessage) { }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;

            if (value != null)
                return value.IndexOf("//", StringComparison.Ordinal) == -1;

            return true;
        }
    }

    public static class MustNotContainUrlProtocolExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotContainUrlProtocol<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustNotContainUrlProtocol());
        }
    }
}
