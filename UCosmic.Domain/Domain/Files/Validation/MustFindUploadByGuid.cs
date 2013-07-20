using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Files
{
    public class MustFindUploadByGuid : PropertyValidator
    {
        public const string FailMessageFormat = "Unable to find an upload with id '{0}'.";

        private readonly IQueryEntities _entities;

        internal MustFindUploadByGuid(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is Guid) && !(context.PropertyValue is Guid?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on Guid properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (Guid?)context.PropertyValue;
            if (value == null || value == Guid.Empty) return false;

            var entity = _entities.Query<Upload>()
                .SingleOrDefault(x => value.Value.Equals(x.Guid));

            return entity != null;
        }
    }

    public static class MustFindUploadByGuidExtensions
    {
        public static IRuleBuilderOptions<T, Guid?> MustFindUploadByGuid<T>
            (this IRuleBuilder<T, Guid?> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUploadByGuid(entities));
        }

        public static IRuleBuilderOptions<T, Guid> MustFindUploadByGuid<T>
        (this IRuleBuilder<T, Guid> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUploadByGuid(entities));
        }
    }
}
