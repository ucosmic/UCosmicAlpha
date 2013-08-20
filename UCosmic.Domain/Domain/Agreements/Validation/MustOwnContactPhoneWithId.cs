using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustOwnContactPhoneWithId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement contact phone with id '{0}' does not exist under agreement contact with id '{1}' and agreement with id '{2}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _contactId;
        private readonly Func<T, int> _phoneId;

        internal MustOwnContactPhoneWithId(IQueryEntities entities, Func<T, int> contactId, Func<T, int> phoneId)
            : base(FailMessageFormat.Replace("{0}", "{PhoneId}").Replace("{1}", "{ContactId}").Replace("{2}", "{AgreementId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (contactId == null) throw new ArgumentNullException("contactId");
            if (phoneId == null) throw new ArgumentNullException("phoneId");
            _entities = entities;
            _contactId = contactId;
            _phoneId = phoneId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var contactId = _contactId((T)context.Instance);
            var phoneId = _phoneId((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);
            context.MessageFormatter.AppendArgument("ContactId", contactId);
            context.MessageFormatter.AppendArgument("PhoneId", phoneId);

            var entity = _entities.Query<AgreementContactPhone>()
                .SingleOrDefault(x => x.Id == phoneId && x.OwnerId == contactId && x.Owner.AgreementId == agreementId);

            return entity != null;
        }
    }

    public static class MustOwnContactPhoneWithIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustOwnContactPhoneWithId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> contactId, Func<T, int> phoneId)
        {
            return ruleBuilder.SetValidator(new MustOwnContactPhoneWithId<T>(entities, contactId, phoneId));
        }
    }
}
