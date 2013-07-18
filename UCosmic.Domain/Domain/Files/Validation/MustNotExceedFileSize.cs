using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustNotExceedFileSize<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The file '{0}' is not allowed because it is {1} in size. Only files {2} and smaller are allowed.";

        private readonly long _fileSizeInBytes;
        private readonly Func<T, string> _fileName;
        private readonly FileSizeUnitName _unitAbbreviation = FileSizeUnitName.Byte;

        internal MustNotExceedFileSize(decimal fileSizeInBytes, Func<T, string> fileName, FileSizeUnitName? unitAbbreviation = null)
            : base(FailMessageFormat.Replace("{0}", "{FileName}").Replace("{1}", "{ActualSize}").Replace("{2}", "{MaxSize}"))
        {
            _fileSizeInBytes = (long)fileSizeInBytes;
            _fileName = fileName;
            if (unitAbbreviation.HasValue) _unitAbbreviation = unitAbbreviation.Value;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is byte[]))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on byte[] properties", GetType().Name));

            var contentLengthInBytes = (long)((byte[])context.PropertyValue).Length;
            if (contentLengthInBytes > _fileSizeInBytes)
            {
                context.MessageFormatter.AppendArgument("FileName", _fileName((T)context.Instance));
                context.MessageFormatter.AppendArgument("ActualSize", contentLengthInBytes.ToFileSize(2, _unitAbbreviation).ToLower());
                context.MessageFormatter.AppendArgument("MaxSize", _fileSizeInBytes.ToFileSize(2, _unitAbbreviation).ToLower());
                return false;
            }

            return true;
        }
    }

    public static class MustNotExceedFileSizeExtensions
    {
        public static IRuleBuilderOptions<T, byte[]> MustNotExceedFileSize<T>
            (this IRuleBuilder<T, byte[]> ruleBuilder, int fileSizeInBytes, Func<T, string> fileName)
        {
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInBytes, fileName));
        }

        public static IRuleBuilderOptions<T, byte[]> MustNotExceedFileSizeInKilobytes<T>
            (this IRuleBuilder<T, byte[]> ruleBuilder, decimal fileSizeInKilobytes, Func<T, string> fileName)
        {
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInKilobytes * 1024, fileName, FileSizeUnitName.Kilobyte));
        }

        public static IRuleBuilderOptions<T, byte[]> MustNotExceedFileSizeInMegabytes<T>
            (this IRuleBuilder<T, byte[]> ruleBuilder, decimal fileSizeInMegabytes, Func<T, string> fileName)
        {
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInMegabytes * 1024 * 1024, fileName, FileSizeUnitName.Megabyte));
        }
    }
}
