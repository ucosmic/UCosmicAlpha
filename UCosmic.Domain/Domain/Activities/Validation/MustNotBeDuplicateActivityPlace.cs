using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustNotBeDuplicateActivityPlace<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;

        internal MustNotBeDuplicateActivityPlace(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base("Activity with id '{ActivityId}' is already associated with place id '{PlaceId}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityId == null) throw new ArgumentNullException("activityId");

            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var placeId = (int)context.PropertyValue;
            var activityId = _activityId((T)context.Instance);
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values.Select(y => y.Locations),
                },
            });

            if (activity.Values.Single(x => x.Mode == activity.Mode).Locations.All(x => x.PlaceId != placeId))
                return true;

            context.MessageFormatter.AppendArgument("ActivityId", activity.RevisionId);
            context.MessageFormatter.AppendArgument("PlaceId", context.PropertyValue);
            return false;
        }
    }

    public static class MustNotBeDuplicateActivityPlaceExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBeDuplicateActivityPlace<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustNotBeDuplicateActivityPlace<T>(queryProcessor, activityId));
        }
    }
}
