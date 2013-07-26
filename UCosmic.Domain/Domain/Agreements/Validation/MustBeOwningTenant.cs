using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class MustBeOwningTenant<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not authorized to create agreements owned by establishment with id '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, IPrincipal> _principal;

        internal MustBeOwningTenant(IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
            : base(FailMessageFormat.Replace("{0}", "{PrincipalName}").Replace("{1}", "{EstablishmentId}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            _queryProcessor = queryProcessor;
            _principal = principal;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IEnumerable<CreateAgreement.AgreementParticipantWrapper>))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IEnumerable<CreateAgreement.AgreementParticipantWrapper> properties", GetType().Name));

            var participants = (IEnumerable<CreateAgreement.AgreementParticipantWrapper>)context.PropertyValue;
            var principal = _principal != null ? _principal((T)context.Instance) : null;

            if (principal == null || string.IsNullOrWhiteSpace(principal.Identity.Name)) return false;


            // make sure user owns the agreement id
            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(principal));
            var owningParticipants = participants.Where(x => x.IsOwner);

            foreach (var owningParticipant in owningParticipants.Where(x => !ownedTenantIds.Contains(x.EstablishmentId)))
            {
                context.MessageFormatter.AppendArgument("EstablishmentId", owningParticipant.EstablishmentId);
                context.MessageFormatter.AppendArgument("PrincipalName", principal.Identity.Name);
                return false;
            }

            return true;
        }
    }

    public static class MustBeOwningTenantExtensions
    {
        public static IRuleBuilderOptions<T, IEnumerable<CreateAgreement.AgreementParticipantWrapper>> MustBeOwningTenant<T>
            (this IRuleBuilder<T, IEnumerable<CreateAgreement.AgreementParticipantWrapper>> ruleBuilder, IProcessQueries queryProcessor, Func<T, IPrincipal> principal)
        {
            return ruleBuilder.SetValidator(new MustBeOwningTenant<T>(queryProcessor, principal));
        }
    }
}
