using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using FluentValidation.Validators;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Identity
{
    public class MustBeAgentForPerson<T> : PropertyValidator
    {
        private const string FailMessageFormat = "User '{UserName}' is not authorized to change data for person '{PersonId}'.";

        private readonly IProcessQueries _queryProcessor;
        private readonly Func<T, int> _personId;

        internal MustBeAgentForPerson(IProcessQueries queryProcessor, Func<T, int> personId)
            : base(FailMessageFormat)
        {
            if (queryProcessor == null) throw new ArgumentNullException("queryProcessor");
            if (personId == null) throw new ArgumentNullException("personId");
            _queryProcessor = queryProcessor;
            _personId = personId;
        }

        protected override bool IsValid(PropertyValidatorContext context)
        {
            var principal = (IPrincipal)context.PropertyValue;
            var personId = _personId((T)context.Instance);

            // user must be affiliated with the person's default affiliation or
            // one of the person's default affiliation's ancestors
            var person = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.User,
                    x => x.Affiliations.Select(y => y.Establishment.Ancestors),
                },
            });

            // when person does not have a user account or default affiliation, anyone is an agent
            if (person != null && person.User == null && person.DefaultAffiliation == null)
                return true;

            // person must have default affiliation in order to have an agent
            if (person != null && person.DefaultAffiliation != null)
            {
                var agent = _queryProcessor.Execute(new MyPerson(principal)
                {
                    EagerLoad = new Expression<Func<Person, object>>[]
                    {
                        x => x.Affiliations,
                    },
                });
                if (agent.DefaultAffiliation != null)
                {
                    var isAuthorized = person.DefaultAffiliation.EstablishmentId == agent.DefaultAffiliation.EstablishmentId
                        || person.DefaultAffiliation.Establishment.Ancestors.Any(x => x.AncestorId == agent.DefaultAffiliation.EstablishmentId);
                    if (isAuthorized) return true;
                }
            }
            
            context.MessageFormatter.AppendArgument("UserName", principal.Identity.Name);
            context.MessageFormatter.AppendArgument("PersonId", personId);
            return false;
        }
    }

    public static class MustBeAgentForPersonExtensions
    {
        public static IRuleBuilderOptions<T, IPrincipal> MustBeAgentForPerson<T>
            (this IRuleBuilder<T, IPrincipal> ruleBuilder, IProcessQueries queryProcessor, Func<T, int> personId)
        {
            return ruleBuilder.SetValidator(new MustBeAgentForPerson<T>(queryProcessor, personId));
        }
    }
}
