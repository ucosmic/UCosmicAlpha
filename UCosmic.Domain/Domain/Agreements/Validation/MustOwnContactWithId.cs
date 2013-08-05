using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustOwnContactWithId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement contact with id '{0}' does not exist under agreement with id '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _contactId;

        internal MustOwnContactWithId(IQueryEntities entities, Func<T, int> contactId)
            : base(FailMessageFormat.Replace("{0}", "{ContactId}").Replace("{1}", "{AgreementId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (contactId == null) throw new ArgumentNullException("contactId");
            _entities = entities;
            _contactId = contactId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var contactId = _contactId((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);
            context.MessageFormatter.AppendArgument("ContactId", contactId);

            var entity = _entities.Query<AgreementContact>()
                .SingleOrDefault(x => x.Id == contactId && x.AgreementId == agreementId);

            return entity != null;
        }
    }

    public static class MustOwnContactWithIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustOwnContactWithId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> contactId)
        {
            return ruleBuilder.SetValidator(new MustOwnContactWithId<T>(entities, contactId));
        }
    }
}
