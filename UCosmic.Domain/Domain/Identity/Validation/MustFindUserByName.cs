using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustFindUserByName : PropertyValidator
    {
        public const string FailMessageFormat = "A user with name '{0}' does not exist.";

        private readonly IQueryEntities _entities;

        internal MustFindUserByName(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (string)context.PropertyValue;

            var entity = _entities.Query<User>()
                .ByName(value);

            return entity != null;
        }
    }

    public static class MustFindUserByNameExtensions
    {
        public static IRuleBuilderOptions<T, string> MustFindUserByName<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindUserByName(entities));
        }
    }
}
