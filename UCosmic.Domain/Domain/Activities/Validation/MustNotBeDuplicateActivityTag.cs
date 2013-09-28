using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustNotBeDuplicateActivityTag<T> : PropertyValidator
    {
        private const string FailMessageFormat = "Activity with id '{ActivityId}' is already tagged with '{PropertyValue}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;

        internal MustNotBeDuplicateActivityTag(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityId == null) throw new ArgumentNullException("activityId");

            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var tagText = (string)context.PropertyValue;
            var activityId = _activityId((T)context.Instance);
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Tags),
                },
            });

            if (activity.Values.Single(x => x.Mode == activity.Mode).Tags.All(x => !tagText.Equals(x.Text)))
                return true;

            context.MessageFormatter.AppendArgument("ActivityId", activity.RevisionId);
            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            return false;
        }
    }

    public static class MustNotBeDuplicateActivityTagExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotBeDuplicateActivityTag<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustNotBeDuplicateActivityTag<T>(queryProcessor, activityId));
        }
    }
}
