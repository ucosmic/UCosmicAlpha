using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivityTag<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on activity document #{1}.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _activityTagId;

        internal MustOwnActivityTag(IQueryEntities entities, Func<T, int> activityTagId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");

            _entities = entities;
            _activityTagId = activityTagId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var principle = (IPrincipal)context.PropertyValue;
            var activityTagId = _activityTagId != null ? _activityTagId((T)context.Instance) : (int?)null;

            var activity = _entities.Query<Activity>()
                                    .Where(x => x.Values.Any(
                                        y => y.Tags.Any(
                                            z => z.RevisionId == activityTagId)))
                                    .SingleOrDefault(w => w.Person.User.Name.Equals(principle.Identity.Name,
                                                     StringComparison.OrdinalIgnoreCase));

            return activity != null;
        }
    }

    public static class MustOwnActivityTagExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivityTag<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IQueryEntities entities, Func<T, int> activityTagId)
        {
            return ruleBuilder.SetValidator(new MustOwnActivityTag<T>(entities, activityTagId));
        }
    }
}
