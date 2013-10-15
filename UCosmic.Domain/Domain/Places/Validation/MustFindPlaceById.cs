using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Places
{
    public class MustFindPlaceById : PropertyValidator
    {
        private readonly IQueryEntities _entities;

        internal MustFindPlaceById(IQueryEntities entities)
            : base("Place with id '{PropertyValue}' does not exist.")
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var value = (int)context.PropertyValue;

            var entity = _entities.Query<Place>()
                .SingleOrDefault(x => x.RevisionId == value);

            if (entity != null) return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            return false;
        }
    }

    public static class MustFindPlaceByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindPlaceById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindPlaceById(entities));
        }
    }
}
