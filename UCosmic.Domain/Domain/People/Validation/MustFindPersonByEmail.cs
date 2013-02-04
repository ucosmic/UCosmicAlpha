using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustFindPersonByEmail : PropertyValidator
    {
        public const string FailMessageFormat = "No person was found for the email address '{0}'.";

        private readonly IQueryEntities _entities;
        private readonly EntityWrapper<Person> _wrapper;

        internal MustFindPersonByEmail(IQueryEntities entities, EntityWrapper<Person> wrapper = null)
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

            var entity = _entities.Query<Person>().ByEmail(value);
            if (_wrapper != null) _wrapper.Entity = entity;

            return entity != null;
        }
    }

    public static class MustFindPersonByEmailExtensions
    {
        public static IRuleBuilderOptions<T, string> MustFindPersonByEmail<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, EntityWrapper<Person> wrapper = null)
        {
            return ruleBuilder.SetValidator(new MustFindPersonByEmail(entities, wrapper));
        }
    }
}
