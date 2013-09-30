using System;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustBeDocumentForActivity<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _activityId;

        internal MustBeDocumentForActivity(IProcessQueries queryProcessor, Func<T, int> activityId)
            : base("Activity document with id '{PropertyValue}' does not belong to activity with id '{ActivityId}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (activityId == null) throw new ArgumentNullException("activityId");
            _queryProcessor = queryProcessor;
            _activityId = activityId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var documentId = (int)context.PropertyValue;
            var activityId = _activityId((T) context.Instance);

            var document = _queryProcessor.Execute(new ActivityDocumentById(documentId)
            {
                EagerLoad = new Expression<Func<ActivityDocument, object>>[]
                {
                    x => x.ActivityValues
                }
            });
            if (document == null || document.ActivityValues.ActivityId == activityId)
                return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            context.MessageFormatter.AppendArgument("ActivityId", activityId);
            return false;
        }
    }

    public static class MustBeDocumentForActivityExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeDocumentForActivity<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> activityId)
        {
            return ruleBuilder.SetValidator(new MustBeDocumentForActivity<T>(queryProcessor, activityId));
        }
    }
}
