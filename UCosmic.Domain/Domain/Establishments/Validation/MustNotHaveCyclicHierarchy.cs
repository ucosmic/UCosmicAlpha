﻿using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustNotHaveCyclicHierarchy<T> : PropertyValidator
    {
        public const string FailMessageFormat = "'{1}' is not a valid parent for '{0}' because {2}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _ownId;

        internal MustNotHaveCyclicHierarchy(IQueryEntities entities, Func<T, int> ownId)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentName}")
                .Replace("{1}", "{ParentName}")
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

            var parentId = (int)context.PropertyValue;
            var ownId = _ownId((T)context.Instance);
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
                context.MessageFormatter.AppendArgument("ParentName", entity.TranslatedName);
                context.MessageFormatter.AppendArgument("FailJustification", "they are the same establishment");
            }

            if (entity.Offspring.Select(x => x.OffspringId).Contains(parentId))
            {
                isValid = false;
                context.MessageFormatter.AppendArgument("FailJustification", "'{ParentName}' is already a child of '{EstablishmentName}'");
                var proposedParent = entity.Offspring.Select(x => x.Offspring).Single(x => x.RevisionId == parentId);
                context.MessageFormatter.AppendArgument("ParentName", proposedParent.TranslatedName);
            }

            if (isValid)
            {
                context.MessageFormatter.AppendArgument("EstablishmentName", entity.TranslatedName);
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
