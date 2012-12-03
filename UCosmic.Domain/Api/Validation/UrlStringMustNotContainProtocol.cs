using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic
{
    public class UrlStringMustNotContainProtocol : PropertyValidator
    {
        public UrlStringMustNotContainProtocol() 
            : base("Please enter a URL without the protocol (http:// or https://).") { }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format("The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var url = (string)context.PropertyValue;

            if (url != null)
                return url.IndexOf("//", StringComparison.Ordinal) == -1;

            return true;
        }
    }

    public static class UrlStringMustNotContainProtocolExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotContainUrlProtocol<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new UrlStringMustNotContainProtocol());
        }
    }
}
