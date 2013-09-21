using System;
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
            if (mode == null) throw new ArgumentNullException("mode");
            _queryProcessor = queryProcessor;
            _mode = mode;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityId = (int)context.PropertyValue;
            var mode = _mode((T) context.Instance);
            var entity = _queryProcessor.Execute(new ActivityValuesByActivityIdAndMode(activityId, mode));

            if (entity == null)
            {
                context.MessageFormatter.AppendArgument("ActivityMode", mode.AsSentenceFragment());
                return false;
            }

            return true;
        }
    }

    public static class MustHaveValuesForModeExtensions
    {
        public static IRuleBuilderOptions<T, int> MustHaveValuesForMode<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, ActivityMode> mode)
        {
            return ruleBuilder.SetValidator(new MustHaveValuesForMode<T>(queryProcessor, mode));
        }
    }
}
