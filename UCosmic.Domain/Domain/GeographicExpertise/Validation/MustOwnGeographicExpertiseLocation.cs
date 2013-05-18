using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.GeographicExpertises
{
    public class MustOwnGeographicExpertiseLocation<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on geographic expertise #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _geographicExpertiseLocationId;

        internal MustOwnGeographicExpertiseLocation(IQueryEntities entities, Func<T, int> geographicExpertiseLocationId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _geographicExpertiseLocationId = geographicExpertiseLocationId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principle = (IPrincipal)context.PropertyValue;
            var geographicExpertiseLocationId = _geographicExpertiseLocationId != null ? _geographicExpertiseLocationId((T)context.Instance) : (int?)null;

            Person person = null;
            var geographicExpertiseLocation = _entities.Query<GeographicExpertiseLocation>().SingleOrDefault(x => x.RevisionId == geographicExpertiseLocationId);
            if (geographicExpertiseLocation != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == geographicExpertiseLocation.Expertise.PersonId);
            }

            return (person != null)
                       ? person.User.Name.Equals(principle.Identity.Name, StringComparison.OrdinalIgnoreCase)
                       : false;
        }
    }

    public static class MustOwnGeographicExpertiseLocationExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnGeographicExpertiseLocation<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> geographicExpertiseId)
        {
            return ruleBuilder.SetValidator(new MustOwnGeographicExpertiseLocation<T>(entities, geographicExpertiseId));
        }
    }
}
