using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustNotFindEmailAddressByValue : PropertyValidator
    {
        public const string FailMessageFormat = "The email address '{0}' is already in use.";

        private readonly IProcessQueries _queries;

        internal MustNotFindEmailAddressByValue(IProcessQueries queries)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (queries == null) throw new ArgumentNullException("queries");
            _queries = queries;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var value = (string)context.PropertyValue;

            var entity = _queries.Execute(new EmailAddressBy(value));

            if (entity == null) return true;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            return false;
        }
    }

    public static class MustNotFindEmailAddressByValueExtensions
    {
        public static IRuleBuilderOptions<T, string> MustNotFindEmailAddressByValue<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queries)
        {
            return ruleBuilder.SetValidator(new MustNotFindEmailAddressByValue(queries));
        }
    }
}
