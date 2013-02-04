using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustFindEstablishmentByEmail : PropertyValidator
    {
        public const string FailMessageFormat = "Establishment for email '{0}' could not be found.";

        private readonly IQueryEntities _entities;
        private readonly EntityWrapper<Establishment> _wrapper;

        internal MustFindEstablishmentByEmail(IQueryEntities entities, EntityWrapper<Establishment> wrapper = null)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _wrapper = wrapper;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (string)context.PropertyValue;

            var entity = _entities.Query<Establishment>().ByEmail(value);
            if (_wrapper != null) _wrapper.Entity = entity;

            return entity != null;
        }
    }

    public static class MustFindEstablishmentByEmailExtensions
    {
        public static IRuleBuilderOptions<T, string> MustFindEstablishmentByEmail<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, EntityWrapper<Establishment> wrapper = null)
        {
            return ruleBuilder.SetValidator(new MustFindEstablishmentByEmail(entities, wrapper));
        }
    }
}
