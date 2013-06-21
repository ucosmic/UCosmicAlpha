using System;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class MustNotBeSamePerson<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Cannot delete current user '{0}'";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _personId;

        internal MustNotBeSamePerson(IQueryEntities entities, Func<T, int> personId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _personId = personId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var name = (string)context.PropertyValue;
            var user = _entities.Query<User>().ByName(name);
            var personId = _personId((T)context.Instance);

            return (user != null) ? user.Person.RevisionId != personId : false;
        }
    }

    public static class MustNotBeSamePersonExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeSamePerson<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> personId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSamePerson<T>(entities, personId));
        }
    }
}
