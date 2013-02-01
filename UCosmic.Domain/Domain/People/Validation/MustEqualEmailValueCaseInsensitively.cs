using System;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustEqualEmailValueCaseInsensitively<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Email address '{0}' does not match the current spelling case insensitively.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _number;
        private readonly Func<T, string> _userName;

        internal MustEqualEmailValueCaseInsensitively(IQueryEntities entities, Func<T, int> number, Func<T, string> userName)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            _number = number;
            _userName = userName;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var value = (string)context.PropertyValue;
            var number = _number((T)context.Instance);
            var userName = _userName((T)context.Instance);

            context.MessageFormatter.AppendArgument("PropertyValue", value);

            var entity = _entities.Query<EmailAddress>()
                .ByUserNameAndNumber(userName, number);

            return entity != null && entity.Value.Equals(value, StringComparison.OrdinalIgnoreCase);
        }
    }

    public static class MustEqualEmailValueCaseInsensitivelyExtensions
    {
        public static IRuleBuilderOptions<T, string> MustEqualEmailValueCaseInsensitively<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> number, Func<T, string> userName)
        {
            return ruleBuilder.SetValidator(new MustEqualEmailValueCaseInsensitively<T>(entities, number, userName));
        }
    }
}
