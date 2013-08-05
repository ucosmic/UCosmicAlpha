using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustFindEmailByPersonIdAndNumber<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Email with number '{1}' could not be found for person with id '{0}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _number;

        internal MustFindEmailByPersonIdAndNumber(IQueryEntities entities, Func<T, int> number)
            : base(FailMessageFormat.Replace("{0}", "{PersonId}").Replace("{1}", "{EmailNumber}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;
            _number = number;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var personId = (int) context.PropertyValue;
            var number = _number((T)context.Instance);

            context.MessageFormatter.AppendArgument("PersonId", personId);
            context.MessageFormatter.AppendArgument("EmailNumber", number);

            var entity = _entities.Query<EmailAddress>()
                .SingleOrDefault(x => x.PersonId == personId && x.Number == number);

            return entity != null;
        }
    }

    public static class MustFindEmailByPersonIdAndNumberExtensions
    {
        public static IRuleBuilderOptions<T, int> MustFindEmailByPersonIdAndNumber<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> number)
        {
            return ruleBuilder.SetValidator(new MustFindEmailByPersonIdAndNumber<T>(entities, number));
        }
    }
}
