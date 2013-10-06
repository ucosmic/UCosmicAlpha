using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustNotExceedFileSize<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The file '{0}' is not allowed because it is {1} in size. Only files {2} and smaller are allowed.";

        private readonly decimal _fileSizeInBytes;
        private readonly Func<T, string> _fileName;
        private readonly FileSizeUnitName _unit = FileSizeUnitName.Byte;
        private readonly IQueryEntities _entities;

        internal MustNotExceedFileSize(decimal fileSizeInBytes, FileSizeUnitName unit, Func<T, string> fileName, IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{FileName}").Replace("{1}", "{ActualSize}").Replace("{2}", "{MaxSize}"))
        {
            _fileSizeInBytes = fileSizeInBytes;
            _fileName = fileName;
            _unit = unit;
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            decimal contentLengthInBytes;
            string fileName;
            if (_entities != null)
            {
                var uploadId = (Guid) context.PropertyValue;
                var upload = _entities.Query<Upload>().Single(x => x.Guid == uploadId);
                contentLengthInBytes = upload.Length;
                fileName = upload.FileName;
            }
            else
            {
                contentLengthInBytes = context.PropertyValue is byte[] ? ((byte[])context.PropertyValue).Length : (long)context.PropertyValue;
                fileName = _fileName((T) context.Instance);
            }

            if (contentLengthInBytes > _fileSizeInBytes)
            {
                context.MessageFormatter.AppendArgument("FileName", fileName);
                context.MessageFormatter.AppendArgument("ActualSize", contentLengthInBytes.ToFileSize(2, _unit).ToLower());
                context.MessageFormatter.AppendArgument("MaxSize", _fileSizeInBytes.ToFileSize(2, _unit).ToLower());
                return false;
            }

            return true;
        }
    }

    public static class MustNotExceedFileSizeExtensions
    {
        public static IRuleBuilderOptions<T, byte[]> MustNotExceedFileSize<T>
            (this IRuleBuilder<T, byte[]> ruleBuilder, decimal fileSize, FileSizeUnitName unit, Func<T, string> fileName)
        {
            var fileSizeInBytes = fileSize.ConvertToBytes(unit);
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInBytes, unit, fileName, null));
        }

        public static IRuleBuilderOptions<T, Guid> MustNotExceedFileSize<T>
            (this IRuleBuilder<T, Guid> ruleBuilder, decimal fileSize, FileSizeUnitName unit, IQueryEntities entities)
        {
            var fileSizeInBytes = fileSize.ConvertToBytes(unit);
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInBytes, unit, null, entities));
        }

        public static IRuleBuilderOptions<T, long> MustNotExceedFileSize<T>
            (this IRuleBuilder<T, long> ruleBuilder, decimal fileSize, FileSizeUnitName unit, Func<T, string> fileName)
        {
            var fileSizeInBytes = fileSize.ConvertToBytes(unit);
            return ruleBuilder.SetValidator(new MustNotExceedFileSize<T>(fileSizeInBytes, unit, fileName, null));
        }

        private static decimal ConvertToBytes(this decimal fileSize, FileSizeUnitName unit)
        {
            const int factor = 1024;
            const int twoFactor = 1024 * 1024;
            var fileSizeInBytes = fileSize;
            if (unit == FileSizeUnitName.Kilobyte) fileSizeInBytes = fileSizeInBytes * factor;
            if (unit == FileSizeUnitName.Megabyte) fileSizeInBytes = fileSizeInBytes * twoFactor;
            if (unit == FileSizeUnitName.Gigabyte) fileSizeInBytes = fileSizeInBytes * twoFactor * factor;
            if (unit == FileSizeUnitName.Terabyte) fileSizeInBytes = fileSizeInBytes * twoFactor * twoFactor;
            if (unit == FileSizeUnitName.Petabyte) fileSizeInBytes = fileSizeInBytes * twoFactor * twoFactor * factor;
            if (unit == FileSizeUnitName.Exabyte) fileSizeInBytes = fileSizeInBytes * twoFactor * twoFactor * twoFactor;
            return fileSizeInBytes;
        }
    }
}
