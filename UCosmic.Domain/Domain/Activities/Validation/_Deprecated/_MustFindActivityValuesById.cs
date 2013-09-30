//using System;
//using FluentValidation;
//using FluentValidation.Validators;

//namespace UCosmic.Domain.Activities
//{
//    public class MustFindActivityValuesById : PropertyValidator
//    {
//        private readonly IQueryEntities _entities;

//        internal MustFindActivityValuesById(IQueryEntities entities)
//            : base("Activity values with id '{PropertyValue}' does not exist.")
//        {
//            if (entities == null) throw new ArgumentNullException("entities");
//            _entities = entities;
//        }

//        protected override bool IsValid(PropertyValidatorContext context)
//        {
//            var activityValuesId = (int)context.PropertyValue;

//            var entity = _entities.Query<ActivityValues>()
//                .ById(activityValuesId);

//            if (entity == null)
//            {
//                context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
//                return false;
//            }

//            return true;
//        }
//    }

//    public static class MustFindActivityValuesByIdExtensions
//    {
//        public static IRuleBuilderOptions<T, int> MustFindActivityValuesById<T>
//            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
//        {
//            return ruleBuilder.SetValidator(new MustFindActivityValuesById(entities));
//        }
//    }
//}
