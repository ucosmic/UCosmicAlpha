using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Resources;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustHaveDefaultAffiliationWithOffspring<T> : PropertyValidator
    {
        private const string PersonFailMessageFormat = "Person '{PropertyValue}' cannot be affiliated with establishment '{EstablishmentId}' because it is not part of his or her default affiliation.";
        private const string PrincipalFailMessageFormat = "User '{PropertyValue}' cannot be affiliated with establishment '{EstablishmentId}' because it is not part of his or her default affiliation.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _establishmentId;

        internal MustHaveDefaultAffiliationWithOffspring(IProcessQueries queryProcessor, Func<T, int> establishmentId)
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

            var eagerLoad = new Expression<Func<Person, object>>[]
            {
                x => x.Affiliations.Select(y => y.Establishment.Offspring),
            };

            var person = principal != null
                ? _queryProcessor.Execute(new MyPerson(principal) { EagerLoad = eagerLoad, })
                : _queryProcessor.Execute(new PersonById(personId) { EagerLoad = eagerLoad, });

            var offspringOfDefault = person.DefaultAffiliation != null
                ? person.DefaultAffiliation.Establishment.Offspring.FirstOrDefault(x => x.OffspringId == establishmentId)
                : null;
            if (offspringOfDefault != null) return true;

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

    public static class MustHaveDefaultAffiliationWithOffspringExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustHaveDefaultAffiliationWithOffspring<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustHaveDefaultAffiliationWithOffspring<T>(queryProcessor, establishmentId));
        }

        public static IRuleBuilderOptions<T, int> MustHaveDefaultAffiliationWithOffspring<T>
            (this IRuleBuilder<T, int> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustHaveDefaultAffiliationWithOffspring<T>(queryProcessor, establishmentId));
        }
    }
}
