using System;
using System.IO;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustHaveFileExtension : PropertyValidator
    {
        public const string FailMessageFormat = "Files with extension '{0}' are not allowed.";

        private readonly string[] _validExtensions;

        internal MustHaveFileExtension(string[] validExtensions)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            _validExtensions = validExtensions;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var fileName = (string)context.PropertyValue;
            var extension = Path.GetExtension(fileName);
            if (string.IsNullOrWhiteSpace(extension)) return false;
            context.MessageFormatter.AppendArgument("PropertyValue", extension);

            var isValid = _validExtensions.Select(x => string.Format(".{0}", x))
                .Any(x => x.Equals(extension, StringComparison.OrdinalIgnoreCase));

            return isValid;
        }
    }

    public static class MustHaveFileExtensionExtensions
    {
        public static IRuleBuilderOptions<T, string> MustHaveFileExtension<T>
            (this IRuleBuilder<T, string> ruleBuilder, params string[] validExtensions)
        {
            return ruleBuilder.SetValidator(new MustHaveFileExtension(validExtensions));
        }
    }
}
