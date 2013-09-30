using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Activities
{
    public class MustFindActivityDocumentById : PropertyValidator
    {
        private readonly IProcessQueries _queryProcessor;

        internal MustFindActivityDocumentById(IProcessQueries queryProcessor)
            : base("Activity document with id '{PropertyValue}' does not exist.")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var documentId = (int)context.PropertyValue;

            var entity = _queryProcessor.Execute(new ActivityDocumentById(documentId));

            if (entity != null) return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            return false;
        }
    }

    public static class MustFindActivityDocumentByIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindActivityDocumentById<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor)
        {
            return ruleBuilder.SetValidator(new MustFindActivityDocumentById(queryProcessor));
        }
    }
}
