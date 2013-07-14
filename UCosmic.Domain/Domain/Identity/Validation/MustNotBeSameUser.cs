using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

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
            if (!(context.PropertyValue is string) && !(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string and IPrincipal properties", GetType().Name));

            var userName = context.PropertyValue is IPrincipal
                ? ((IPrincipal)context.PropertyValue).Identity.Name
                : (string)context.PropertyValue;
            var user = _entities.Query<User>().ByName(userName);

            context.MessageFormatter.AppendArgument("PropertyValue", userName);
            var userId = _userId((T)context.Instance);

            return (user != null) && user.RevisionId != userId;
        }
    }

    public static class MustNotBeSameUserExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeSameUser<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> userId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSameUser<T>(entities, userId));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustNotBeSameUser<T>
        (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> userId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSameUser<T>(entities, userId));
        }
    }
}
