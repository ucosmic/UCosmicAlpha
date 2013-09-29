using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustFindActivityDocumentById : PropertyValidator
    {
        private readonly IQueryEntities _entities;

        internal MustFindActivityDocumentById(IQueryEntities entities)
            : base("Activity document with id '{PropertyValue}' does not exist.")
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var activityDocumentId = (int)context.PropertyValue;

            var entity = _entities.Query<ActivityDocument>()
                .SingleOrDefault(x => x.RevisionId == activityDocumentId);

            if (entity == null)
            {
                context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
                return false;
            }

            return true;
        }
    }

    public static class MustFindActivityDocumentByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindActivityDocumentById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities)
        {
            return ruleBuilder.SetValidator(new MustFindActivityDocumentById(entities));
        }
    }
}
