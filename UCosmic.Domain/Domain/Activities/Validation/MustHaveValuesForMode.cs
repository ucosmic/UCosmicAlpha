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
        private readonly Func<T, ActivityMode> _mode;

        internal MustHaveValuesForMode(IProcessQueries queryProcessor, Func<T, ActivityMode> mode)
            : base("There are no values for activity with id '{PropertyValue}' and mode '{ActivityMode}'.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
            _mode = mode;
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
            var mode = _mode != null ? _mode((T) context.Instance) : activity.Mode;
            var values = activity.Values.FirstOrDefault(x => x.Mode == mode);

            if (values != null) return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            context.MessageFormatter.AppendArgument("ActivityMode", mode);
            return false;
        }
    }

    public static class MustHaveValuesForModeExtensions
    {
        public static IRuleBuilderOptions<T, int> MustHaveValuesForMode<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, ActivityMode> mode = null)
        {
            return ruleBuilder.SetValidator(new MustHaveValuesForMode<T>(queryProcessor, mode));
        }
    }
}
