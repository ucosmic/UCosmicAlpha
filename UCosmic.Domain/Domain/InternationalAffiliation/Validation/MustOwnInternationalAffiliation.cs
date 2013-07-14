using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class MustOwnInternationalAffiliation<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on affiliation #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _affiliationId;

        internal MustOwnInternationalAffiliation(IQueryEntities entities, Func<T, int> affiliationId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _affiliationId = affiliationId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principal = (IPrincipal)context.PropertyValue;
            var affiliationId = _affiliationId != null ? _affiliationId((T)context.Instance) : (int?)null;

            Person person = null;
            var geographicExpertise = _entities.Query<InternationalAffiliation>().SingleOrDefault(x => x.RevisionId == affiliationId);
            if (geographicExpertise != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == geographicExpertise.PersonId);
            }

            return (person != null) && person.User.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnAffiliationExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnAffiliation<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> affiliationId)
        {
            return ruleBuilder.SetValidator(new MustOwnInternationalAffiliation<T>(entities, affiliationId));
        }
    }
}
