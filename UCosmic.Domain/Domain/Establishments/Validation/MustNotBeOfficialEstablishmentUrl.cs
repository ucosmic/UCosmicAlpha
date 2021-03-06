﻿using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustNotBeOfficialEstablishmentUrl : PropertyValidator
    {
        public const string FailMessageFormat = "Establishment URL with id '{0}' cannot be deleted because it is the official URL.";

        private readonly IQueryEntities _entities;

        internal MustNotBeOfficialEstablishmentUrl(IQueryEntities entities)
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

            var entity = _entities.Query<EstablishmentUrl>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentUrl, object>>[]
                {
                    x => x.ForEstablishment,
                })
                .Single(x => x.RevisionId == value);

            var owner = _entities.Query<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Urls,
                })
                .Single(x => x.RevisionId == entity.ForEstablishment.RevisionId);

            return !entity.IsOfficialUrl || owner.Urls.Count == 1;
        }
    }

    public static class MustNotBeOfficialEstablishmentUrlExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBeOfficialEstablishmentUrl<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustNotBeOfficialEstablishmentUrl(entities));
        }
    }
}
