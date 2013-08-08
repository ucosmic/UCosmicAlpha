using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Degrees
{
    public class MustFindDegreeById : PropertyValidator
    {
        public const string FailMessageFormat = "Degree with id '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{DegreeId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        internal MustFindDegreeById(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindDegreeById(IProcessQueries queryProcessor)
            : base(FailMessageFormatter)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var degreeId = (int)context.PropertyValue;
            context.MessageFormatter.AppendArgument("DegreeId", context.PropertyValue);

            var entity = _entities != null
                ? _entities.Query<Degree>().SingleOrDefault(x => x.RevisionId == degreeId)
                : _queryProcessor.Execute(new DegreeById(degreeId));

            return entity != null;
        }
    }

    public static class MustFindDegreeByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindDegreeById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindDegreeById(entities));
        }

        public static IRuleBuilderOptions<T, int> MustFindDegreeById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindDegreeById(queryProcessor));
        }
    }
}
