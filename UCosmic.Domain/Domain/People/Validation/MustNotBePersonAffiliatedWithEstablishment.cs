using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustNotBePersonAffiliatedWithEstablishment<T> : PropertyValidator
    {
        public const string FailMessageFormat = "Person '{0}' is already affiliated with establishment '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _establishmentId;

        internal MustNotBePersonAffiliatedWithEstablishment(IQueryEntities entities, Func<T, int> establishmentId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{EstablishmentId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is int))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on int properties", GetType().Name));

            var personId = (int)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);

            context.MessageFormatter.AppendArgument("PropertyValue", personId);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);

            //var entity = _entities.Query<Person>()
            //    .EagerLoad(_entities, new Expression<Func<Person, object>>[]
            //    {
            //        x => x.Affiliations.Select(y => y.Establishment),
            //    })
            //    .SingleOrDefault(x => x.RevisionId == personId);

            //return entity != null && entity.GetAffiliation(establishmentId) == null;
            var entity = _entities.Query<Affiliation>().SingleOrDefault(x =>
                x.PersonId == personId && x.EstablishmentId == establishmentId);
            return entity == null;
        }
    }

    public static class MustNotBePersonAffiliatedWithEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, int> MustNotBePersonAffiliatedWithEstablishment<T>
            (this IRuleBuilder<T, int> ruleBuilder, IQueryEntities entities, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustNotBePersonAffiliatedWithEstablishment<T>(entities, establishmentId));
        }
    }
}
