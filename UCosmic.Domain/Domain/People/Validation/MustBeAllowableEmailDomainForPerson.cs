using System;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class MustBeAllowableEmailDomainForPerson<T> : PropertyValidator
    {
        public const string FailMessageFormat = "The email domain '{0}' is not allowed for this person.";

        private readonly IProcessQueries _queries;
        private readonly Func<T, int> _personId;
        private readonly Func<T, Person> _person;

        internal MustBeAllowableEmailDomainForPerson(IProcessQueries queries, Func<T, int> personId)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (queries == null) throw new ArgumentNullException("queries");
            if (personId == null) throw new ArgumentNullException("personId");
            _queries = queries;
            _personId = personId;
        }

        internal MustBeAllowableEmailDomainForPerson(IProcessQueries queries, Func<T, Person> person)
            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}"))
        {
            if (queries == null) throw new ArgumentNullException("queries");
            if (person == null) throw new ArgumentNullException("person");
            _queries = queries;
            _person = person;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var value = (string)context.PropertyValue;
            var domain = value.GetEmailDomain();

            var person = _person != null ? _person((T) context.Instance) : null;
            if (person == null)
            {
                var personId = _personId((T) context.Instance);
                person = _queries.Execute(new PersonById(personId));
            }

            var establishmentId = person.User != null && person.User.TenantId.HasValue
                ? person.User.TenantId.Value
                : person.DefaultAffiliation != null ? person.DefaultAffiliation.EstablishmentId : 0;
            if (establishmentId != 0)
            {
                var allowedDomains = _queries.Execute(new EmailDomainsByEstablishment(establishmentId))
                    .Select(x => x.Value.ToLower()).ToArray();
                if (allowedDomains.Contains(domain.ToLower())) return true;
            }

            context.MessageFormatter.AppendArgument("PropertyValue", domain);
            return false;
        }
    }

    public static class MustBeAllowableEmailDomainForPersonExtensions
    {
        public static IRuleBuilderOptions<T, string> MustBeAllowableEmailDomainForPerson<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queries, Func<T, int> personId)
        {
            return ruleBuilder.SetValidator(new MustBeAllowableEmailDomainForPerson<T>(queries, personId));
        }

        public static IRuleBuilderOptions<T, string> MustBeAllowableEmailDomainForPerson<T>
            (this IRuleBuilder<T, string> ruleBuilder, IProcessQueries queries, Func<T, Person> person)
        {
            return ruleBuilder.SetValidator(new MustBeAllowableEmailDomainForPerson<T>(queries, person));
        }
    }
}
