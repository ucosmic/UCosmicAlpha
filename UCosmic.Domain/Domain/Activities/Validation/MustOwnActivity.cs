using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivity<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on activity #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _activityId;

        internal MustOwnActivity(IQueryEntities entities, Func<T, int> activityId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principal = (IPrincipal)context.PropertyValue;
            var activityId = _activityId != null ? _activityId((T)context.Instance) : (int?)null;

            Person person = null;
            var activity = _entities.Query<Activity>().SingleOrDefault(x => x.RevisionId == activityId);
            if (activity != null)
            {
                person = _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == activity.PersonId);
            }

            return (person != null) && person.User.Name.Equals(principal.Identity.Name, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustOwnActivityExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivity<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustOwnActivity<T>(entities, activityId));
        }
    }
}
