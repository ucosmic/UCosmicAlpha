﻿using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class MustFindInternationalAffiliationLocationById : PropertyValidator
    {
        public const string FailMessageFormat = "AffiliationLocation with id '{0}' does not exist.";

        private readonly IQueryEntities _entities;

        internal MustFindInternationalAffiliationLocationById(IQueryEntities entities)
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

            var entity = _entities.Query<InternationalAffiliationLocation>()
                .SingleOrDefault(x => x.RevisionId == value);

            return entity != null;
        }
    }

    public static class MustFindAffiliationLocationByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindAffiliationLocationById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindInternationalAffiliationLocationById(entities));
        }
    }
}
