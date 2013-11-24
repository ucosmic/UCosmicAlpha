using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.Identity
{
    public class MustBeTenantOfEstablishment<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not a tenant of establishment with id '{1}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;

        internal MustBeTenantOfEstablishment(IProcessQueries queryProcessor, Func<T, int> establishmentId)
            : base(FailMessageFormat.Replace("{0}", "{PrincipalName}").Replace("{1}", "{EstablishmentId}"))
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (establishmentId == null) throw new ArgumentNullException("establishmentId");
            _queryProcessor = queryProcessor;
            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is IPrincipal))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on IPrincipal properties", GetType().Name));

            var principal = (IPrincipal)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);
            context.MessageFormatter.AppendArgument("PrincipalName", principal.Identity.Name);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);


            // make sure user is tenant of establishment id
            var ownedTenantIds = _queryProcessor.Execute(new MyOwnedTenantIds(principal));

            return ownedTenantIds.Contains(establishmentId);
        }
    }

    public static class MustBeTenantOfEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustBeTenantOfEstablishment<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustBeTenantOfEstablishment<T>(queryProcessor, establishmentId));
        }
    }
}
