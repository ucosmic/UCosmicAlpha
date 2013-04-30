using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustNotHaveCyclicHierarchy<T> : PropertyValidator
    {
        public const string FailMessageFormat = "'{2}' is not a valid parent for '{1}' because {3}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _ownId;

        internal MustNotHaveCyclicHierarchy(IQueryEntities entities, Func<T, int> ownId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}")
                .Replace("{1}", "{EstablishmentName}")
                .Replace("{2}", "{ParentName}")
                .Replace("{3}", "{FailJustification}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _ownId = ownId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is int?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var parentId = (int?)context.PropertyValue;
            var ownId = _ownId != null ? _ownId((T)context.Instance) : (int?)null;
            var entity = _entities.Query<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Offspring.Select(y => y.Offspring),
                    x => x.Names.Select(y => y.TranslationToLanguage),
                })
                .Single(x => x.RevisionId == ownId);

            var isValid = true;

            if (ownId == parentId)
            {
                isValid = false;
                context.MessageFormatter.AppendArgument("EstablishmentName", entity.TranslatedName);
                context.MessageFormatter.AppendArgument("ParentName", entity.TranslatedName);
                context.MessageFormatter.AppendArgument("FailJustification", "they are the same establishment");
            }

            if (entity.Offspring.Select(x => x.OffspringId).Contains(parentId.Value))
            {
                context.MessageFormatter.AppendArgument("FailJustification", "'{ParentName}' is a child of '{EstablishmentName}'");
                context.MessageFormatter.AppendArgument("EstablishmentName", entity.TranslatedName);
                var proposedParent = entity.Offspring.Select(x => x.Offspring).Single(x => x.RevisionId == parentId);
                context.MessageFormatter.AppendArgument("ParentName", proposedParent.TranslatedName);
                isValid = false;
            }

            return isValid;
        }
    }

    public static class MustNotHaveCyclicHierarchyExtensions
    {
        public static IRuleBuilderOptions<T, int?> MustNotHaveCyclicHierarchy<T>
            (this IRuleBuilder<T, int?> ruleBuilder, IQueryEntities entities, Func<T, int> ownId = null)
        {
            return ruleBuilder.SetValidator(new MustNotHaveCyclicHierarchy<T>(entities, ownId));
        }
    }
}
