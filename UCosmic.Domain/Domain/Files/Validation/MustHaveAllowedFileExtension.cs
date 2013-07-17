using System;
using System.IO;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustHaveAllowedFileExtension : PropertyValidator
    {
        public const string FailMessageFormat = "The file '{0}' is not allowed because it has a '{1}' extension. Only the following file extensions are allowed: {2}";

        private readonly string[] _validExtensions;

        internal MustHaveAllowedFileExtension(string[] validExtensions)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{FileExtension}").Replace("{2}", "{AllowedExtensions}"))
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
            var dottedValidExtensions = _validExtensions.Select(x => string.Format(".{0}", x)).ToArray();
            context.MessageFormatter.AppendArgument("PropertyValue", fileName);
            context.MessageFormatter.AppendArgument("FileExtension", extension);
            context.MessageFormatter.AppendArgument("AllowedExtensions", dottedValidExtensions.Implode(", "));

            var isValid = dottedValidExtensions.Any(x => x.Equals(extension, StringComparison.OrdinalIgnoreCase));

            return isValid;
        }
    }

    public static class MustHaveAllowedFileExtensionExtensions
    {
        public static IRuleBuilderOptions<T, string> MustHaveAllowedFileExtension<T>
            (this IRuleBuilder<T, string> ruleBuilder, params string[] validExtensions)
        {
            return ruleBuilder.SetValidator(new MustHaveAllowedFileExtension(validExtensions));
        }
    }
}
