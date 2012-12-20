using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustNotBeOnlyEstablishmentName : PropertyValidator
    {
        public const string FailMessageFormat = "Establishment name with id '{0}' cannot be deleted because it is the only name.";

        private readonly IQueryEntities _entities;

        internal MustNotBeOnlyEstablishmentName(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
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

            var entity = _entities.Query<EstablishmentName>()
                .Single(x => x.RevisionId == value);

            var siblings = _entities.Query<EstablishmentName>()
                .Where(x => x.ForEstablishment.RevisionId == entity.ForEstablishment.RevisionId);

            return siblings.Count() > 1;
        }
    }

    public static class MustNotBeOnlyEstablishmentNameExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBeOnlyEstablishmentName<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustNotBeOnlyEstablishmentName(entities));
        }
    }
}
