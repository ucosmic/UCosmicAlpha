using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustHaveValuesForMode<T> : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;

        internal MustHaveValuesForMode(IProcessQueries queryProcessor)
            : base("There are no values for activity with id '{PropertyValue}' and mode '{ActivityMode}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityId = (int)context.PropertyValue;
            var activity = _queryProcessor.Execute(new ActivityById(activityId)
            {
                EagerLoad = new Expression<Func<Activity, object>>[]
                {
                    x => x.Values,
                },
            });
            var values = activity.Values.FirstOrDefault(x => x.Mode == activity.Mode);

            if (values == null)
            {
                context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
                context.MessageFormatter.AppendArgument("ActivityMode", activity.Mode);
                return false;
            }

            return true;
        }
    }

    public static class MustHaveValuesForModeExtensions
    {
        public static IRuleBuilderOptions<T, int> MustHaveValuesForMode<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustHaveValuesForMode<T>(queryProcessor));
        }
    }
}
