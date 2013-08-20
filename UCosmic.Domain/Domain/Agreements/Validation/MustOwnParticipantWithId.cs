using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustOwnParticipantWithId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement participant with id '{0}' does not exist under agreement with id '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _establishmentId;

        internal MustOwnParticipantWithId(IQueryEntities entities, Func<T, int> establishmentId)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentId}").Replace("{1}", "{AgreementId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            if (establishmentId == null) throw new ArgumentNullException("establishmentId");
            _entities = entities;
            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);

            var entity = _entities.Query<AgreementParticipant>()
                .SingleOrDefault(x => x.EstablishmentId == establishmentId && x.AgreementId == agreementId);

            return entity != null;
        }
    }

    public static class MustOwnParticipantWithIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustOwnParticipantWithId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustOwnParticipantWithId<T>(entities, establishmentId));
        }
    }
}
