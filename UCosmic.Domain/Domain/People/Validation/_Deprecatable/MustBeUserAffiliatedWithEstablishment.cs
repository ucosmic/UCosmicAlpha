using System;
using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Validators;

namespace UCosmic.Domain.People
{
    public class MustBeUserAffiliatedWithEstablishment<T> : PropertyValidator
    {
        public const string FailMessageFormat = "User '{0}' is not affiliated with establishment '{1}'.";

        private readonly IQueryEntities _entities;
        private readonly Func<T, int> _establishmentId;

        internal MustBeUserAffiliatedWithEstablishment(IQueryEntities entities, Func<T, int> establishmentId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}").Replace("{1}", "{EstablishmentId}"))
        {
            if (entities == null) throw new ArgumentNullException("entities");
            _entities = entities;

            _establishmentId = establishmentId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (!(context.PropertyValue is string))
                throw new NotSupportedException(string.Format(
                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

            var userName = (string)context.PropertyValue;
            var establishmentId = _establishmentId((T)context.Instance);

            context.MessageFormatter.AppendArgument("PropertyValue", userName);
            context.MessageFormatter.AppendArgument("EstablishmentId", establishmentId);

            var entity = _entities.Query<Affiliation>()
                .EagerLoad(_entities, new Expression<Func<Affiliation, object>>[]
                {
                    x => x.Person.User,
                })
                .ByUserNameAndEstablishmentId(userName, establishmentId);

            return entity != null;
        }
    }

    public static class MustBeUserAffiliatedWithEstablishmentExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeUserAffiliatedWithEstablishment<T>
            (this IRuleBuilder<T, string> ruleBuilder, IQueryEntities entities, Func<T, int> establishmentId)
        {
            return ruleBuilder.SetValidator(new MustBeUserAffiliatedWithEstablishment<T>(entities, establishmentId));
        }
    }
}
