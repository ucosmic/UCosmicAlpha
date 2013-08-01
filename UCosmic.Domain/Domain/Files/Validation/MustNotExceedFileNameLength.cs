using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustNotExceedFileNameLength : PropertyValidator
    {
        public const string FailMessageFormat = "File name cannot exceed '{0}' characters.";

        private readonly int _maxLength;
        private readonly IQueryEntities _entities;

        internal MustNotExceedFileNameLength(int maxLength, IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{MaxLength}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _maxLength = maxLength;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is Guid))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on Guid properties", GetType().Name));

            context.MessageFormatter.AppendArgument("MaxLength", _maxLength);
            var uploadId = (Guid)context.PropertyValue;

            var entity = _entities.Query<Upload>()
                .Single(x => uploadId.Equals(x.Guid));

            return entity.FileName.Length <= _maxLength;
        }
    }

    public static class MustNotExceedFileNameLengthExtensions
    {
        public static IRuleBuilderOptions<T, Guid> MustNotExceedFileNameLength<T>
        (this IRuleBuilder<T, Guid> ruleBuilder, int maxLength, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustNotExceedFileNameLength(maxLength, entities));
        }
    }
}
