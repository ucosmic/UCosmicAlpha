using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustFindActivityById : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;

        internal MustFindActivityById(IProcessQueries queryProcessor)
            : base("Activity with id '{PropertyValue}' does not exist.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityId = (int)context.PropertyValue;
            var entity = _queryProcessor.Execute(new ActivityById(activityId));
            return entity != null;
        }
    }

    public static class MustFindActivityByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindActivityById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindActivityById(queryProcessor));
        }
    }
}
