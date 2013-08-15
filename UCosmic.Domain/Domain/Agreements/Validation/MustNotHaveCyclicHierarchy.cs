using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustNotHaveCyclicHierarchy<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement with id '{0}' is not a valid umbrella for agreement with id '{1}' because {2}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _ownId;

        internal MustNotHaveCyclicHierarchy(IQueryEntities entities, Func<T, int> ownId)
            : base(FailMessageFormat.Replace("{0}", "{UmbrellaId}")
                .Replace("{1}", "{AgreementId}")
                .Replace("{2}", "{FailJustification}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (ownId == null) throw new ArgumentNullException("ownId");
            _entities = entities;
            _ownId = ownId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is int?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var umbrellaId = (int)context.PropertyValue;
            var ownId = _ownId((T)context.Instance);
            
            var entity = _entities.Query<Agreement>()
                .EagerLoad(_entities, new Expression<Func<Agreement, object>>[]
                {
                    x => x.Offspring.Select(y => y.Offspring),
                })
                .Single(x => x.Id == ownId);

            var isValid = true;

            if (ownId == umbrellaId)
            {
                isValid = false;
                context.MessageFormatter.AppendArgument("FailJustification", "they are the same establishment");
            }

            if (entity.Offspring.Select(x => x.OffspringId).Contains(umbrellaId))
            {
                isValid = false;
                context.MessageFormatter.AppendArgument("FailJustification", "agreement with id '{UmbrellaId}' is already a child of agreement with id '{AgreementId}'");
            }

            if (!isValid)
            {
                context.MessageFormatter.AppendArgument("UmbrellaId", umbrellaId);
                context.MessageFormatter.AppendArgument("AgreementId", ownId);
            }

            return isValid;
        }
    }

    public static class MustNotHaveCyclicHierarchyExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotHaveCyclicHierarchy<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> ownId)
        {
            return ruleBuilder.SetValidator(new MustNotHaveCyclicHierarchy<T>(entities, ownId));
        }
    }
}
