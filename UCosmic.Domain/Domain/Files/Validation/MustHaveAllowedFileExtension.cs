using System;
using System.IO;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustHaveAllowedFileExtension : PropertyValidator
    {
        private const string FailMessageExtensionlessFormat = "The file '{0}' is not allowed because it has no extension. Only files with the {2} or {3} extension are allowed.";
        private const string FailMessageExtensionlessSingleFormat = "The file '{0}' is not allowed because it has no extension. Only files with the '{1}' extension are allowed.";
        private const string FailMessageNamelessFormat = "The file '{0}' is not allowed because it has no name before the extension.";
        private const string FailMessageDisallowedFormat = "The file '{0}' is not allowed because it has a '{1}' extension. Only files eith the {2} or {3} extension are allowed.";
        private const string FailMessageDisallowedSingledFormat = "The file '{0}' is not allowed because it has a '{1}' extension. Only files with the '{1}' extension are allowed.";

        private readonly string[] _validExtensions;

        internal MustHaveAllowedFileExtension(string[] validExtensions)
            : base("{Message}")
        {
            if (validExtensions == null || !validExtensions.Any() || string.IsNullOrWhiteSpace(validExtensions.Implode("")))
                throw new ArgumentException("Cannot be empty.", "validExtensions");
            _validExtensions = validExtensions.Where(x => !string.IsNullOrWhiteSpace(x)).ToArray();
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            // file name must have character content
            var fileName = (string)context.PropertyValue;
            if (string.IsNullOrWhiteSpace(fileName))
            {
                context.MessageFormatter.AppendArgument("Message", MustHaveFileName.FailMessage);
                return false;
            }

            // file name must have an extension
            var dottedValidExtensions = _validExtensions.Select(x => string.Format(".{0}", x)).ToArray();
            var extension = Path.GetExtension(fileName);
            if (string.IsNullOrWhiteSpace(extension))
            {
                var failMessage = _validExtensions.Count() > 1
                    ?  string.Format(FailMessageExtensionlessFormat, 
                        fileName, null, dottedValidExtensions.Take(dottedValidExtensions.Count() - 1).Implode(", "), dottedValidExtensions.Last())
                    : string.Format(FailMessageExtensionlessSingleFormat, fileName, dottedValidExtensions.Single());
                context.MessageFormatter.AppendArgument("Message", failMessage);
                return false;
            }

            // file extension must be in whitelist
            var isAllowedExtension = dottedValidExtensions.Any(x => x.Equals(extension, StringComparison.OrdinalIgnoreCase));
            if (!isAllowedExtension)
            {
                var failMessage = _validExtensions.Count() > 1
                    ? string.Format(FailMessageDisallowedFormat,
                        fileName, extension, dottedValidExtensions.Take(dottedValidExtensions.Count() - 1).Implode(", "), dottedValidExtensions.Last())
                    : string.Format(FailMessageDisallowedSingledFormat, fileName, dottedValidExtensions.Single());
                context.MessageFormatter.AppendArgument("Message", failMessage);
                return false;
            }

            // file must have a name before the extension
            var name = Path.GetFileNameWithoutExtension(fileName);
            if (string.IsNullOrWhiteSpace(name))
            {
                var failMessage = string.Format(FailMessageNamelessFormat, fileName);
                context.MessageFormatter.AppendArgument("Message", failMessage);
                return false;
            }

            return true;
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
