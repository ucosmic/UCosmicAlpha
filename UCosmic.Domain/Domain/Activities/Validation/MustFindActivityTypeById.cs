using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Activities
{
    public class MustFindActivityTypeById : PropertyValidator
    {
        private readonly IQueryEntities _entities;

        internal MustFindActivityTypeById(IQueryEntities entities)
            : base("ActivityType with id '{PropertyValue}' does not exist.")
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            var value = (int)context.PropertyValue;

            var entity = _entities.Query<EmployeeActivityType>()
                .SingleOrDefault(x => x.Id == value);

            return entity != null;
        }
    }

    public static class MustFindActivityTypeByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindActivityTypeById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindActivityTypeById(entities));
        }
    }
}
