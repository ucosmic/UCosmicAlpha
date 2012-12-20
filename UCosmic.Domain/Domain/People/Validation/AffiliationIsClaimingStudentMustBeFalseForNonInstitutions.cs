using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class AffiliationIsClaimingStudentMustBeFalseForNonInstitutions : PropertyValidator
    {
        public const string FailMessageFormat = "Affiliation cannot claim student because establishment '{0}' is not an academic institution.";

        private readonly IQueryEntities _entities;
        private readonly string _establishmentIdPropertyName;

        internal AffiliationIsClaimingStudentMustBeFalseForNonInstitutions(IQueryEntities entities, string establishmentIdPropertyName)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            if (string.IsNullOrWhiteSpace(establishmentIdPropertyName))
                throw new ArgumentException("Cannot be null or whitespace.", "establishmentIdPropertyName");
            _establishmentIdPropertyName = establishmentIdPropertyName;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is bool))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on bool properties", GetType().Name));

            // reflect to get the establishment ID
            var establishmentId = context.Instance.PropertyValue<int>(_establishmentIdPropertyName);

            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
            var isClaimingStudent = (bool)context.PropertyValue;

            var entity = _entities.Query<Establishment>()
                .SingleOrDefault(x => x.RevisionId == establishmentId);

            return entity != null && (entity.IsInstitution || isClaimingStudent == false);
        }
    }

    public static class IsClaimingStudentMustBeFalseForNonInstitutionsExtensions
    {
        public static IRuleBuilderOptions<T, bool> MustBeFalseWhenEstablishmentIsNotInstitution<T>
            (this IRuleBuilder<T, bool> ruleBuilder, IQueryEntities entities, string establishmentIdPropertyName)
        {
            return ruleBuilder.SetValidator(new AffiliationIsClaimingStudentMustBeFalseForNonInstitutions(entities, establishmentIdPropertyName));
        }
    }
}
