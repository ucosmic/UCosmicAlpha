using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.LanguageExpertise
{
    public class MustOwnLanguageExpertise<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on language expertise #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _languageExpertiseId;

        internal MustOwnLanguageExpertise(IQueryEntities entities, Func<T, int> languageExpertiseId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _languageExpertiseId = languageExpertiseId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principal = (IPrincipal)context.PropertyValue;
            var languageExpertiseId = _languageExpertiseId != null ? _languageExpertiseId((T)context.Instance) : (int?)null;

            Person person = null;
            var languageExpertise = _entities.Query<LanguageExpertise>().SingleOrDefault(x => x.RevisionId == languageExpertiseId);
            if (languageExpertise != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == languageExpertise.PersonId);
            }

            return (person != null) && person.User.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnLanguageExpertiseExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnLanguageExpertise<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> languageExpertiseId)
        {
            return ruleBuilder.SetValidator(new MustOwnLanguageExpertise<T>(entities, languageExpertiseId));
        }
    }
}
