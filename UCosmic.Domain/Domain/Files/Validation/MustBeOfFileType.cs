using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustBeOfFileType : PropertyValidator
    {
        public const string FailMessageFormat = "File of type '{0}' not supported.";

        internal MustBeOfFileType()
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            string[] validFileExtensions =
            {
                "jpg",
                "png",
                "tif",
                "bmp",
                "gif",
                "pdf",
                "doc",
                "docx",
                "xls",
                "ppt"
            };

            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (string)context.PropertyValue;

            return Array.Exists(validFileExtensions, i => i == value);
        }
    }

    public static class MustBeOfFileTypeExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeOfFileType<T>
            (this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustBeOfFileType());
        }
    }
}
