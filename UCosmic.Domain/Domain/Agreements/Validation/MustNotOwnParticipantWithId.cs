using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Agreements
{
    public class MustNotOwnParticipantWithId<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Agreement participant with id '{0}' already exists under agreement with id '{1}'.";
        public const string FailMessageNewFormat = "New agreement already contains a participant with id '{0}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;
        private readonly Func<T, IPrincipal> _principal;

        internal MustNotOwnParticipantWithId(IProcessQueries queryProcessor, Func<T, int> establishmentId, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentId}").Replace("{1}", "{AgreementId}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (establishmentId == null) throw new ArgumentNullException("establishmentId");
            if (principal == null) throw new ArgumentNullException("principal");
            _queryProcessor = queryProcessor;
            _establishmentId = establishmentId;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);
            var principal = _principal((T)context.Instance);
            context.MessageFormatter.AppendArgument("AgreementId", agreementId);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);

            var entity = _queryProcessor.Execute(new ParticipantsByAgreementId(principal, agreementId))
                .SingleOrDefault(x => x.EstablishmentId == establishmentId);

            return entity == null;
        }
    }

    public static class MustNotOwnParticipantWithIdExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotOwnParticipantWithId<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustNotOwnParticipantWithId<T>(queryProcessor, establishmentId, principal));
        }
    }
}
