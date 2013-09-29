using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustNotBeDuplicateActivityType<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;

        internal MustNotBeDuplicateActivityType(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base("Activity with id '{ActivityId}' is already associated with activity type id '{PropertyValue}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityId == null) throw new ArgumentNullException("activityId");

            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var typeId = (int)context.PropertyValue;
            var activityId = _activityId((T)context.Instance);
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Types),
                },
            });

            if (activity.Values.Single(x => x.Mode == activity.Mode).Types.All(x => x.TypeId != typeId))
                return true;

            context.MessageFormatter.AppendArgument("ActivityId", activity.RevisionId);
            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            return false;
        }
    }

    public static class MustNotBeDuplicateActivityTypeExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBeDuplicateActivityType<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustNotBeDuplicateActivityType<T>(queryProcessor, activityId));
        }
    }
}
