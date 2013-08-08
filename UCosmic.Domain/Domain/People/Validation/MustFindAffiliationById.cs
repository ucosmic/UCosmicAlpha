using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustFindAffiliationById : PropertyValidator
    {
        public const string FailMessageFormat = "Affiliation with id '{0}' does not exist.";

        private readonly IQueryEntities _entities;

        internal MustFindAffiliationById(IQueryEntities entities)
            : base(FailMessageFormat.Replace("{0}", "{AffiliationId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            context.MessageFormatter.AppendArgument("AffiliationId", context.PropertyValue);
            var value = (int)context.PropertyValue;

            var entity = _entities.Query<Affiliation>()
                .SingleOrDefault(x => x.RevisionId == value);

            return entity != null;
        }
    }

    public static class MustFindAffiliationByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindAffiliationById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindAffiliationById(entities));
        }
    }
}
