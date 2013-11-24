using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Resources;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustNotHaveDefaultAffiliationWithEstablishment<T> : PropertyValidator
    {
        private const string PersonFailMessageFormat = "Person '{PropertyValue}' has a default affiliation with establishment '{EstablishmentId}'.";
        private const string PrincipalFailMessageFormat = "User '{PropertyValue}' has a default affiliation with establishment '{EstablishmentId}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;

        internal MustNotHaveDefaultAffiliationWithEstablishment(IProcessQueries queryProcessor, Func<T, int> establishmentId)
            : base("")
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (establishmentId == null) throw new ArgumentNullException("establishmentId");
            _queryProcessor = queryProcessor;
            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var establishmentId = _establishmentId((T)context.Instance);
            var principalOrPersonId = context.PropertyValue;
            var principal = principalOrPersonId as IPrincipal;
            var personId = principal != null ? 0 : (int)principalOrPersonId;
            if (personId == 0)
            {
                personId = _queryProcessor.Execute(new MyPerson(principal)).RevisionId;
            }

            var entity = _queryProcessor.Execute(new AffiliationByPrimaryKey(personId, establishmentId));
            if (entity == null || !entity.IsDefault) return true;

            if (principal != null)
            {
                ErrorMessageSource = new StaticStringSource(PrincipalFailMessageFormat);
                context.MessageFormatter.AppendArgument("PropertyValue", principal.Identity.Name);
            }
            else
            {
                ErrorMessageSource = new StaticStringSource(PersonFailMessageFormat);
                context.MessageFormatter.AppendArgument("PropertyValue", personId);
            }
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
            return false;
        }
    }

    public static class MustNotHaveDefaultAffiliationWithEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustNotHaveDefaultAffiliationWithEstablishment<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotHaveDefaultAffiliationWithEstablishment<T>(queryProcessor, establishmentId));
        }

        public static IRuleBuilderOptions<T, int> MustNotHaveDefaultAffiliationWithEstablishment<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotHaveDefaultAffiliationWithEstablishment<T>(queryProcessor, establishmentId));
        }
    }
}
