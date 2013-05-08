using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class MustOwnDegree<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on degree #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _degreeId;

        internal MustOwnDegree(IQueryEntities entities, Func<T, int> degreeId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _degreeId = degreeId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principle = (IPrincipal)context.PropertyValue;
            var degreeId = _degreeId != null ? _degreeId((T)context.Instance) : (int?)null;

            Person person = null;
            var degree = _entities.Query<Degree>().SingleOrDefault(x => x.RevisionId == degreeId);
            if (degree != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == degree.PersonId);
            }

            return (person != null)
                       ? person.User.Name.Equals(principle.Identity.Name, StringComparison.OrdinalIgnoreCase)
                       : false;
        }
    }

    public static class MustOwnDegreeExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnDegree<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> degreeId)
        {
            return ruleBuilder.SetValidator(new MustOwnDegree<T>(entities, degreeId));
        }
    }
}
