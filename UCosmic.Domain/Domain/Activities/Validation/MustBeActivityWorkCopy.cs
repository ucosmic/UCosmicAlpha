using System;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustBeActivityWorkCopy<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityOriginalId; 

        internal MustBeActivityWorkCopy(IProcessQueries queryProcessor, Func<T, int> activityOriginalId)
            : base("Activity with id '{PropertyValue}' is not a work copy for activity with id {OriginalId}.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityOriginalId == null) throw new ArgumentNullException("activityOriginalId");
            _queryProcessor = queryProcessor;
            _activityOriginalId = activityOriginalId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityWorkCopyId = (int)context.PropertyValue;
            var activityOriginalId = _activityOriginalId((T)context.Instance);
            var entity = _queryProcessor.Execute(new ActivityById(activityWorkCopyId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Original,
                },
            });

            if (entity != null && entity.Original != null && entity.Original.RevisionId == activityOriginalId)
                return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            context.MessageFormatter.AppendArgument("OriginalId", activityOriginalId);
            return false;
        }
    }

    public static class MustBeActivityWorkCopyExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeActivityWorkCopy<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityOriginalId)
        {
            return ruleBuilder.SetValidator(new MustBeActivityWorkCopy<T>(queryProcessor, activityOriginalId));
        }
    }
}
