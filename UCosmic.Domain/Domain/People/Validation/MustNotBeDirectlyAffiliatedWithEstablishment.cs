using System;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Resources;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustNotBeDirectlyAffiliatedWithEstablishment<T> : PropertyValidator
    {
        private const string PersonFailMessageFormat = "Person '{PropertyValue}' is already affiliated with establishment '{EstablishmentId}'.";
        private const string PrincipalFailMessageFormat = "User '{PropertyValue}' is already affiliated with establishment '{EstablishmentId}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;

        internal MustNotBeDirectlyAffiliatedWithEstablishment(IProcessQueries queryProcessor, Func<T, int> establishmentId)
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

            var duplicate = _queryProcessor.Execute(new AffiliationByPrimaryKey(personId, establishmentId));
            if (duplicate == null) return true;

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

    public static class MustNotBeDirectlyAffiliatedWithEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustNotBeDirectlyAffiliatedWithEstablishment<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotBeDirectlyAffiliatedWithEstablishment<T>(queryProcessor, establishmentId));
        }

        public static IRuleBuilderOptions<T, int> MustNotBeDirectlyAffiliatedWithEstablishment<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotBeDirectlyAffiliatedWithEstablishment<T>(queryProcessor, establishmentId));
        }
    }
}
