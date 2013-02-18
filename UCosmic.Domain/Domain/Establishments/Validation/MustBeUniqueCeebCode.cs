using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustBeUniqueCeebCode<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The CEEB code '{0}' is already assigned to a different institution.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _ownId;

        internal MustBeUniqueCeebCode(IQueryEntities entities, Func<T, int> ownId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _ownId = ownId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            // do not validate unless CEEB code is present
            if (context.PropertyValue == null) return true;

            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (string)context.PropertyValue;
            var ownId = _ownId != null ? _ownId((T)context.Instance) : (int?) null;

            // do not validate unless CEEB code is present
            if (string.IsNullOrEmpty(value)) return true;

            var entity = _entities.Query<Establishment>()
                .SingleOrDefault(
                    x =>
                    (ownId.HasValue ? x.RevisionId != ownId.Value : x.RevisionId != 0) &&
                    (value.Equals(x.CollegeBoardDesignatedIndicator, StringComparison.OrdinalIgnoreCase))
                );

            return entity == null;
        }
    }

    public static class MustBeUniqueCeebCodeExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeUniqueCeebCode<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> ownId = null)
        {
            return ruleBuilder.SetValidator(new MustBeUniqueCeebCode<T>(entities, ownId));
        }
    }
}
