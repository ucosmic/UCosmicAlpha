using System;
using System.Globalization;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivity<T> : PropertyValidator
    {
        private const string FailMessageFormat = "User '{UserName}' is not authorized to perform the '{CommandName}' action on activity with id '{ActivityId}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;
        private readonly Func<T, Activity> _activity;

        internal MustOwnActivity(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityId == null) throw new ArgumentNullException("activityId");

            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        internal MustOwnActivity(IProcessQueries queryProcessor, Func<T, Activity> activity)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activity == null) throw new ArgumentNullException("activity");

            _queryProcessor = queryProcessor;
            _activity = activity;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var principal = (IPrincipal)context.PropertyValue;
            var userName = principal.Identity.Name;
            var activity = _activity != null ? _activity((T)context.Instance) : null;
            if (activity == null)
            {
                var activityId = _activityId((T)context.Instance);
                activity = _queryProcessor.Execute(new ActivityById(activityId)
                {
                    EagerLoad = new Expression<Func<Activity, object>>[]
                    {
                        x => x.Person.User,
                    },
                });
            }

            // return null when activity doesn't exist to prevent exceptions on deletion
            // any other validator must check for the existence of activity first
            if (activity == null || (activity.Person.User != null &&
                activity.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase)))
                return true;

            context.MessageFormatter.AppendArgument("UserName", userName);
            context.MessageFormatter.AppendArgument("CommandName", typeof(T).Name);
            context.MessageFormatter.AppendArgument("ActivityId", activity.RevisionId != 0
                ? activity.RevisionId.ToString(CultureInfo.InvariantCulture)
                : activity.EntityId.ToString());
            return false;
        }
    }

    public static class MustOwnActivityExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivity<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustOwnActivity<T>(queryProcessor, activityId));
        }

        public static IRuleBuilderOptions<T, IPrincipal> MustOwnActivity<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, Activity> activity)
        {
            return ruleBuilder.SetValidator(new MustOwnActivity<T>(queryProcessor, activity));
        }
    }
}
