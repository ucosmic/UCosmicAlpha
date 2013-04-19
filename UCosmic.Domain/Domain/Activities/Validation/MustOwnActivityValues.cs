using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivityValues<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on activity values #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _activityValuesId;

        internal MustOwnActivityValues(IQueryEntities entities, Func<T, int> activityValuesId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _activityValuesId = activityValuesId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principle = (IPrincipal)context.PropertyValue;
            var activityValuesId = _activityValuesId != null ? _activityValuesId((T)context.Instance) : (int?)null;

            var activity = _entities.Query<Activity>()
                                    .Where(x => x.Values.Any(z => z.RevisionId == activityValuesId))
                                    .SingleOrDefault(w => w.Person.User.Name.Equals(principle.Identity.Name,
                                                     StringComparison.OrdinalIgnoreCase));

            return activity != null;
        }
    }

    public static class MustOwnActivityValuesExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivityValues<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustOwnActivityValues<T>(entities, activityId));
        }
    }
}
