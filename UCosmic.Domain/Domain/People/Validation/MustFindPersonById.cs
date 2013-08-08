using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustFindPersonById : PropertyValidator
    {
        public const string FailMessageFormat = "Person with id '{0}' does not exist.";
        private static readonly string FailMessageFormatter = FailMessageFormat.Replace("{0}", "{PersonId}");

        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        internal MustFindPersonById(IQueryEntities entities)
            : base(FailMessageFormatter)
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        internal MustFindPersonById(IProcessQueries queryProcessor)
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

            var personId = (int)context.PropertyValue;
            context.MessageFormatter.AppendArgument("PersonId", personId);

            var entity = _entities != null
                ? _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == personId)
                : _queryProcessor.Execute(new PersonById(personId));

            return entity != null;
        }
    }

    public static class MustFindPersonByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindPersonById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindPersonById(entities));
        }

        public static IRuleBuilderOptions<T, int> MustFindPersonById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindPersonById(queryProcessor));
        }
    }
}
