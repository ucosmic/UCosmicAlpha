using System;
using System.Security.Principal;
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
            if (!(context.PropertyValue is string) && !(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string and IPrincipal properties", GetType().Name));

            var userName = context.PropertyValue is IPrincipal
                ? ((IPrincipal)context.PropertyValue).Identity.Name
                : (string)context.PropertyValue;
            var user = _entities.Query<User>().ByName(userName);

            context.MessageFormatter.AppendArgument("PropertyValue", userName);
            var personId = _personId((T)context.Instance);

            return (user != null) && user.Person.RevisionId != personId;
        }
    }

    public static class MustNotBeSamePersonExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeSamePerson<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> personId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSamePerson<T>(entities, personId));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustNotBeSamePerson<T>
        (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> personId)
        {
            return ruleBuilder.SetValidator(new MustNotBeSamePerson<T>(entities, personId));
        }
    }
}
