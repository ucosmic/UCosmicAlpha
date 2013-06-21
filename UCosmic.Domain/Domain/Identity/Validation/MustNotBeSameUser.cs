using System;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Identity
{
    public class MustNotBeSameUser<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Cannot delete current user '{0}'";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _userId;

        internal MustNotBeSameUser(IQueryEntities entities, Func<T, int> userId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _userId = userId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var name = (string)context.PropertyValue;
            var user = _entities.Query<User>().ByName(name);
            var userId = _userId((T)context.Instance);

            return (user != null) ? user.RevisionId != userId : false;
        }
    }

    public static class MustNotBeSameUserExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeSameUser<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> userId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSameUser<T>(entities, userId));
        }
    }
}
