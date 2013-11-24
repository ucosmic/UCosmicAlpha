using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustOwnAffiliation<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on affiliation with id '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _affiliationId;

        internal MustOwnAffiliation(IQueryEntities entities, Func<T, int> affiliationId)
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
            var affiliationId = _affiliationId((T)context.Instance);

            var affiliation = _entities.Query<Affiliation>()
                .EagerLoad(_entities, new Expression<Func<Affiliation, object>>[]
                        {
                            x => x.Person.User,
                        })
                .SingleOrDefault(x => x.RevisionId == affiliationId);

            return affiliation != null
                && affiliation.Person.User != null
                && affiliation.Person.User.Name.Equals(principal.Identity.Name,
                    StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnAffiliationExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnAffiliation<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> affiliationId)
        {
            return ruleBuilder.SetValidator(new MustOwnAffiliation<T>(entities, affiliationId));
        }
    }
}
