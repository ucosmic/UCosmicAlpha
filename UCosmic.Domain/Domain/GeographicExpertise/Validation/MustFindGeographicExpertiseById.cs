using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.GeographicExpertise
{
    public class MustFindGeographicExpertiseById : PropertyValidator
    {
        public const string FailMessageFormat = "GeographicExpertise with id '{0}' does not exist.";

        private readonly IQueryEntities _entities;

        internal MustFindGeographicExpertiseById(IQueryEntities entities)
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

            var entity = _entities.Query<GeographicExpertise>()
                .SingleOrDefault(x => x.RevisionId == value);

            return entity != null;
        }
    }

    public static class MustFindGeographicExpertiseByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindGeographicExpertiseById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindGeographicExpertiseById(entities));
        }
    }
}
