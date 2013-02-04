using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustFindConfirmationByToken : PropertyValidator
    {
        public const string FailMessageFormat = "Email confirmation token '{0}' is not valid.";

        private readonly IQueryEntities _entities;
        private readonly EntityWrapper<EmailConfirmation> _wrapper;

        internal MustFindConfirmationByToken(IQueryEntities entities, EntityWrapper<EmailConfirmation> wrapper = null)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _wrapper = wrapper;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is Guid))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on Guid properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (Guid)context.PropertyValue;

            var entity = _entities.Query<EmailConfirmation>().ByToken(value);
            if (_wrapper != null) _wrapper.Entity = entity;

            return entity != null;
        }
    }

    public static class MustFindConfirmationByTokenExtensions
    {
        public static IRuleBuilderOptions<T, Guid> MustFindConfirmationByToken<T>
            (this IRuleBuilder<T, Guid> ruleBuilder, IQueryEntities entities, EntityWrapper<EmailConfirmation> wrapper = null)
        {
            return ruleBuilder.SetValidator(new MustFindConfirmationByToken(entities, wrapper));
        }
    }
}
