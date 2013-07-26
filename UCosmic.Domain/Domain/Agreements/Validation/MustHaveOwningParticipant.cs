using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustHaveOwningParticipant : PropertyValidator
    {
        public const string FailMessage = "Agreement must have at least one owning participant.";

        internal MustHaveOwningParticipant()
            : base(FailMessage)
        {
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IEnumerable<CreateAgreement.AgreementParticipantWrapper>))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IEnumerable<CreateAgreement.AgreementParticipantWrapper> properties", 
                        GetType().Name));

            var participants = (IEnumerable<CreateAgreement.AgreementParticipantWrapper>)context.PropertyValue;
            return participants.Any(x => x.IsOwner);
        }
    }

    public static class MustHaveOwningParticipantExtensions
    {
        public static IRuleBuilderOptions<T, IEnumerable<CreateAgreement.AgreementParticipantWrapper>> MustHaveOwningParticipant<T>
            (this IRuleBuilder<T, IEnumerable<CreateAgreement.AgreementParticipantWrapper>> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new MustHaveOwningParticipant());
        }
    }
}
