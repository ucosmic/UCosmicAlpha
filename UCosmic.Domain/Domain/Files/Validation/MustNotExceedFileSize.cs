using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustNotExceedFileSize<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The file '{0}' is not allowed because it is {1} in size. Only files {2} and smaller are allowed.";

        private readonly decimal _fileSizeInBytes;
        private readonly Func<T, string> _fileName;
        private readonly FileSizeUnitAbbreviation _unitAbbreviation = FileSizeUnitAbbreviation.B;

        internal MustNotExceedFileSize(decimal fileSizeInBytes, Func<T, string> fileName, FileSizeUnitAbbreviation? unitAbbreviation = null)
            : base(FailMessageFormat.Replace("{0}", "{FileName}").Replace("{1}", "{ActualSize}").Replace("{2}", "{MaxSize}"))
        {
            _fileSizeInBytes = fileSizeInBytes;
            _fileName = fileName;
            if (unitAbbreviation.HasValue) _unitAbbreviation = unitAbbreviation.Value;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is byte[]))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on byte[] properties", GetType().Name));

            var contentLengthInBytes = ((byte[])context.PropertyValue).Length;
            if (contentLengthInBytes > _fileSizeInBytes)
            {
                context.MessageFormatter.AppendArgument("FileName", _fileName((T)context.Instance));
                var unitName = FileSizeUnitName.Byte.ToString().ToLower();
                var actualSize = (decimal)contentLengthInBytes;
                var maxSize = _fileSizeInBytes;
                var actualSizeText = string.Format("{0} {1}", (int)actualSize, actualSize != 1m ? unitName + "s" : unitName);
                var maxSizeText = string.Format("{0} {1}", maxSize, maxSize != 1m ? unitName + "s" : unitName);
                switch (_unitAbbreviation)
                {
                    case FileSizeUnitAbbreviation.Kb:
                        unitName = FileSizeUnitName.Kilobyte.ToString().ToLower();
                        actualSize = (decimal)contentLengthInBytes / 1024;
                        maxSize = _fileSizeInBytes / 1024;
                        actualSizeText = string.Format("{0:f2} {1}", actualSize, actualSize != 1m ? unitName + "s" : unitName);
                        maxSizeText = string.Format("{0:f2} {1}", maxSize, maxSize != 1m ? unitName + "s" : unitName);
                        break;
                    case FileSizeUnitAbbreviation.Mb:
                        unitName = FileSizeUnitName.Megabyte.ToString().ToLower();
                        actualSize = (decimal)contentLengthInBytes / 1024 / 1024;
                        maxSize = _fileSizeInBytes / 1024 / 1024;
                        actualSizeText = string.Format("{0:f2} {1}", actualSize, actualSize != 1m ? unitName + "s" : unitName);
                        maxSizeText = string.Format("{0:f2} {1}", maxSize, maxSize != 1m ? unitName + "s" : unitName);
                        break;
                }
                context.MessageFormatter.AppendArgument("ActualSize", actualSizeText);
                context.MessageFormatter.AppendArgument("MaxSize", maxSizeText);
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
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInKilobytes * 1024, fileName, FileSizeUnitAbbreviation.Kb));
        }

        public static IRuleBuilderOptions<T, byte[]> MustNotExceedFileSizeInMegabytes<T>
            (this IRuleBuilder<T, byte[]> ruleBuilder, decimal fileSizeInMegabytes, Func<T, string> fileName)
        {
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInMegabytes * 1024 * 1024, fileName, FileSizeUnitAbbreviation.Mb));
        }
    }
}
