using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MustBeOwnedByPrincipal<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The agreement with id '{0}' is not owned by user '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeOwnedByPrincipal(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{PrincipalName}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on integer properties", GetType().Name));

            var agreementId = (int)context.PropertyValue;
            var principal = _principal != null ? _principal((T)context.Instance) : null;

            if (principal == null || string.IsNullOrWhiteSpace(principal.Identity.Name)) return false;

            context.MessageFormatter.AppendArgument("PropertyValue", context.PropertyValue);
            context.MessageFormatter.AppendArgument("PrincipalName", principal.Identity.Name);

            // make sure user owns the agreement id
            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(principal));
            var owningParticipants = _queryProcessor.Execute(new ParticipantsByAgreementId(principal, agreementId)).Where(x => x.IsOwner);

            return owningParticipants.Any(x => ownedTenantIds.Contains(x.EstablishmentId));
        }
    }

    public static class MustBeOwnedByPrincipalExtensions
    {
        public static IRuleBuilderOptions<T, int> MustBeOwnedByPrincipal<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeOwnedByPrincipal<T>(queryProcessor, principal));
        }
    }
}
