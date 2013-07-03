using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustFindAgreementById : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement with id '{0}' does not exist.";

        private readonly IQueryEntities _entities;

        internal MustFindAgreementById(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is int?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (int?)context.PropertyValue;
            if (value == null) return false;

            var entity = _entities.Query<Agreement>()
                .ById(value.Value);

            return entity != null;
        }
    }

    public static class MustFindAgreementByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindAgreementById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindAgreementById(entities));
        }

        public static IRuleBuilderOptions<T, int?> MustFindAgreementById<T>
            (this IRuleBuilder<T, int?> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindAgreementById(entities));
        }
    }
}
