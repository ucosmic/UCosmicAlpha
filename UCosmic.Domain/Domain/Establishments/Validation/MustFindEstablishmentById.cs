using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Establishments
{
    public class MustFindEstablishmentById : PropertyValidator
    {
        public const string FailMessageFormat = "Establishment with id '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{EstablishmentId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        internal MustFindEstablishmentById(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindEstablishmentById(IProcessQueries queryProcessor)
            : base(FailMessageFormatter)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int) && !(context.PropertyValue is int?))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var establishmentId = (int)context.PropertyValue;
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);

            var entity = _entities != null
                ? _entities.Query<Establishment>().SingleOrDefault(x => x.RevisionId == establishmentId)
                : _queryProcessor.Execute(new EstablishmentById(establishmentId));

            return entity != null;
        }
    }

    public static class MustFindEstablishmentByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindEstablishmentById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindEstablishmentById(entities));
        }

        public static IRuleBuilderOptions<T, int> MustFindEstablishmentById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindEstablishmentById(queryProcessor));
        }
    }
}
