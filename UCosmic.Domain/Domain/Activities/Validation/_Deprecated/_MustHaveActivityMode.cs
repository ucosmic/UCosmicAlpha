//using FluentValidation;
//using FluentValidation.Validators;

//namespace UCosmic.Domain.Activities
//{
//    public class MustHaveActivityMode : PropertyValidator
//    {
//        internal MustHaveActivityMode()
//            : base("{PropertyName} must be either 'Public' or 'Draft'.")
//        {
//        }

//        protected override bool IsValid(PropertyValidatorContext context)
//        {
//            var modeText = (string)context.PropertyValue;

//            return ActivityMode.Public.AsSentenceFragment().Equals(modeText)
//                || ActivityMode.Draft.AsSentenceFragment().Equals(modeText);
//        }
//    }

//    public static class MustHaveActivityModeExtensions
//    {
//        public static IRuleBuilderOptions<T, string> MustHaveActivityMode<T>
//            (this IRuleBuilder<T, string> ruleBuilder)
//        {
//            return ruleBuilder.SetValidator(new MustHaveActivityMode());
//        }
//    }
//}
