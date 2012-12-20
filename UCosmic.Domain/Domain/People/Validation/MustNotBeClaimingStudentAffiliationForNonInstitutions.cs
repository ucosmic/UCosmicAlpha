using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class MustNotBeClaimingStudentAffiliationForNonInstitutions<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Affiliation cannot claim student because establishment '{0}' is not an academic institution.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _establishmentId;

        internal MustNotBeClaimingStudentAffiliationForNonInstitutions(IQueryEntities entities, Func<T, int> establishmentId)
            : base(FailMessageFormat.Replace("{0}", "{EstablishmentId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is bool))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on bool properties", GetType().Name));

            var establishmentId = _establishmentId((T)context.Instance);

            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);
            var isClaimingStudent = (bool)context.PropertyValue;

            var entity = _entities.Query<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Type.Category,
                })
                .SingleOrDefault(x => x.RevisionId == establishmentId);

            return entity != null && (entity.IsInstitution || isClaimingStudent == false);
        }
    }

    public static class MustNotBeClaimingStudentAffiliationForNonInstitutionsExtensions
    {
        public static IRuleBuilderOptions<T, bool> MustNotBeClaimingStudentAffiliationForNonInstitutions<T>
            (this IRuleBuilder<T, bool> ruleBuilder, IQueryEntities entities, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotBeClaimingStudentAffiliationForNonInstitutions<T>(entities, establishmentId));
        }
    }
}
