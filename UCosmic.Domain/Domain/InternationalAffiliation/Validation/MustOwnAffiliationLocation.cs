using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class MustOwnAffiliationLocation<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on affiliation #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _affiliationLocationId;

        internal MustOwnAffiliationLocation(IQueryEntities entities, Func<T, int> affiliationLocationId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _affiliationLocationId = affiliationLocationId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principal = (IPrincipal)context.PropertyValue;
            var affiliationLocationId = _affiliationLocationId != null ? _affiliationLocationId((T)context.Instance) : (int?)null;

            Person person = null;
            var affiliationLocation = _entities.Query<InternationalAffiliationLocation>().SingleOrDefault(x => x.RevisionId == affiliationLocationId);
            if (affiliationLocation != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == affiliationLocation.InternationalAffiliation.PersonId);
            }

            return (person != null) && person.User.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnAffiliationLocationExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnAffiliationLocation<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> affiliationId)
        {
            return ruleBuilder.SetValidator(new MustOwnAffiliationLocation<T>(entities, affiliationId));
        }
    }
}
