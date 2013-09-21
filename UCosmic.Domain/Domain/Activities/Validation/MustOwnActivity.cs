using System;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustOwnActivity<T> : PropertyValidator
    {
        public const string FailMessageFormat =
            "User '{0}' is not authorized to perform this action on activity with id '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;

        internal MustOwnActivity(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base("User '{UserName}' is not authorized to perform the '{CommandName}' action on activity with id '{PropertyValue}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");

            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var principal = (IPrincipal)context.PropertyValue;
            var userName = principal.Identity.Name;
            var activityId = _activityId((T)context.Instance);

            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Person.User,
                },
            });

            if (activity == null || (activity.Person.User != null &&
                activity.Person.User.Name.Equals(userName, StringComparison.OrdinalIgnoreCase)))
                return true;

            context.MessageFormatter.AppendArgument("UserName", userName);
            context.MessageFormatter.AppendArgument("CommandName", typeof(T).Name);
            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
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
    }
}
