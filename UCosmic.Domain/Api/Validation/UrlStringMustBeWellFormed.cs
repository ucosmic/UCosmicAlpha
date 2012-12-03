using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic
{
    public class UrlStringMustBeWellFormed : PropertyValidator
    {
        internal UrlStringMustBeWellFormed()
            : base("The value '{PropertyValue}' does not appear to be a valid URL.") { }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;

            if (value != null)
            {
                context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
                if (value.IndexOf('.') == -1) return false;
                var absoluteValue = string.Format("http://{0}", value);
                var isValid = Uri.IsWellFormedUriString(absoluteValue, UriKind.Absolute);
                return isValid;
            }

            return true;
        }
    }

    public static class UrlStringMustBeWellFormedExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeWellFormedUrl<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new UrlStringMustBeWellFormed());
        }
    }
}
