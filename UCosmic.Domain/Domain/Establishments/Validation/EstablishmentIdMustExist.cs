using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentIdMustExist : PropertyValidator
    {
        private readonly IQueryEntities _entities;

        internal EstablishmentIdMustExist(IQueryEntities entities)
            : base("Establishment with id '{PropertyValue}' does not exist")
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (int)context.PropertyValue;

            var entity = _entities.Query<Establishment>()
                .SingleOrDefault(y => y.RevisionId == value);

            return entity != null;
        }
    }

    public static class EstablishmentIdMustExistExtensions
    {
        public static IRuleBuilderOptions<T, int> MustExistAsEstablishment<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new EstablishmentIdMustExist(entities));
        }
    }
}
