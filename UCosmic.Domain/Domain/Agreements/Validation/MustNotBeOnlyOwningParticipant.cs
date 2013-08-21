using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustNotBeOnlyOwningParticipant<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Participant with establishment id '{0}' cannot be deleted because it is the only owner of agreement with id '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _agreementId;
        private readonly Func<T, IPrincipal> _principal;

        internal MustNotBeOnlyOwningParticipant(IProcessQueries queryProcessor, Func<T, int> agreementId, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentId}").Replace("{1}", "{AgreementId}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (agreementId == null) throw new ArgumentNullException("agreementId");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _agreementId = agreementId;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var establishmentId = (int)context.PropertyValue;
            var agreementId = _agreementId((T)context.Instance);
            var principal = _principal((T)context.Instance);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);

            // make sure there are other owning participants aside from the one with establishmentId
            var participants = _queryProcessor.Execute(new ParticipantsByAgreementId(principal, agreementId))
                .Where(x => x.IsOwner && x.EstablishmentId != establishmentId);

            return participants.Any();
        }
    }

    public static class MustNotBeOnlyOwningParticipantExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBeOnlyOwningParticipant<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> agreementId, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustNotBeOnlyOwningParticipant<T>(queryProcessor, agreementId, principal));
        }
    }
}
